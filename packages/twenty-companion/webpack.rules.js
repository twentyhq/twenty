module.exports = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.(png|jpe?g|gif)$/i,
    type: 'asset/inline',
  },
  {
    test: /\.svg$/i,
    type: 'asset/resource',
  },
];
