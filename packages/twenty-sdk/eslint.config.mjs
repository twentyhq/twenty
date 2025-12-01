import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/dist/**'],
  },
  {
    rules: {
      'no-console': 'off',
    },
    ignores: ['src/**/*.ts', '!src/cli/**/*.ts'],
  },
];
