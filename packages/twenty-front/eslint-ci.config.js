import baseConfig from './eslint.config.js';

export default [
  ...baseConfig,
  // CI-specific rules override
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-console': 'error',
    },
  },
];
