var express = require('express');
var router = express.Router();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var mkdirp = require('mkdirp');
var config = require('../config');

/* GET users listing. */
router.post('/formidable', function (req, res, next) {

  // create an incoming form object
  var form = new formidable.IncomingForm();
  var data = {};

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  var date = new Date(), y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  var uploadDir = [config.uploadDir, y, m, d].join('/');
  mkdirp.sync(uploadDir);

  form.uploadDir = uploadDir;

  form.on('field', function (field, value) {
    console.log(field, ":", value);
  });

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function (field, file) {
    if(file.name !== '') {
      var dest = path.join(form.uploadDir, Date.now() + '_' + file.name);
      data[file.name] = dest;
      fs.rename(file.path, dest);
    }
  });

  // log any errors that occur
  form.on('error', function (err) {
    console.log('An error has occured: ' + err);
    res.json({result: 'error'});
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function () {
    console.log(data);
    res.json({result: 'success', data: data});
  });

  // parse the incoming request containing the form data
  form.parse(req);
});

module.exports = router;
