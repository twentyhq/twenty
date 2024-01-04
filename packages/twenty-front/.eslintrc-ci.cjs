module.exports = {
  extends: ['./.eslintrc.cjs'],
  rules: {
    'no-console': 'error',
  },
  overrides: [
    {
      files: ['.storybook/**/*', '**/*.stories.tsx', '**/*.test.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
