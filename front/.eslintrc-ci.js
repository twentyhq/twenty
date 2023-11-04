module.exports = {
  overrides: [
    {
      files: ['*.stories.tsx', '*.test.ts'],
      rules: {
        'no-console': 'off',
      }
    },
  ],
  extends: [
    './.eslintrc.js'
  ],
  rules: {
    'no-console': 'error',
  }
};
