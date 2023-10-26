module.exports = {
  overrides: [
    {
      files: ['*.stories.tsx', '*.test.ts'],
      rules: {
        'no-console': 'off',
      }
    },
  ],
  rules: {
    'no-console': 'error',
  }
};
