module.exports = {
  extends: ['./.eslintrc.cjs'],
  rules: {
    'no-console': 'error',
  },
  overrides: [
    {
      files: [
        '.storybook/**/*',
        '**/*.stories.tsx',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
