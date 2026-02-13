import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/dist/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    rules: {
      'no-console': 'off',
    },
    ignores: ['src/**/*.ts', '!src/cli/**/*.ts'],
  },
];
