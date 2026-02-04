import baseConfig from 'eslint.config.mjs';

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
];
