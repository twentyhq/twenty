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
    './.eslintrc.cjs'
  ],
  rules: {
    'no-console': 'error',
  }
};
