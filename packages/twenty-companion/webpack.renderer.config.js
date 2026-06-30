const rules = require('./webpack.rules');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  entry: {
    renderer: './src/renderer.js',
    'note-editor/renderer': './src/pages/note-editor/renderer.js',
  },
};
