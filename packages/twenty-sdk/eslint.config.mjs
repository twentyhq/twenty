import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['*/.{js,jsx,ts,tsx}'],
    rules: {
      'prettier/prettier': 'error',
    },
  },
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
