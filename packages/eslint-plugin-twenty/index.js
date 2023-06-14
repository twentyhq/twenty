// eslint-disable-next-line @typescript-eslint/no-var-requires
const noHardcodedColors = require('./rules/no-hardcoded-colors');
const cssAlphabetically = require('./rules/sort-css-properties-alphabetically');

module.exports = {
  rules: {
    'no-hardcoded-colors': noHardcodedColors,
    'sort-css-properties-alphabetically': cssAlphabetically,
  },
};
