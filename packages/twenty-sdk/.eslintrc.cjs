module.exports = {
  extends: ['../../.eslintrc.global.cjs'],
  overrides: [
    {
      files: ['**/*.ts'],
      parserOptions: {
        project: ['packages/twenty-sdk/tsconfig.*.json'],
      },
      rules: {
        '@nx/dependency-checks': 'error',
      },
    },
  ],
};
