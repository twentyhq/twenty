// eslint-disable-next-line @typescript-eslint/no-var-requires
const noHardcodedColors = require('./rules/no-hardcoded-colors');

module.exports = {
  rules: {
    'no-hardcoded-colors': noHardcodedColors,
  },
};
