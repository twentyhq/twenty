const path = require('path');
const baseConfig = require('./eslint.config.js');

module.exports = [
  ...baseConfig.default,
  // CI-specific rules override
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-console': 'error',
    },
  },
];
