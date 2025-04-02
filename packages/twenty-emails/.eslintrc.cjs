module.exports = {
  extends: ['../../.eslintrc.cjs', '../../.eslintrc.react.cjs'],
  ignorePatterns: ['!**/*'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: ['packages/twenty-emails/tsconfig.*.json'],
      },
      rules: {
        '@nx/dependency-checks': 'error',
      },
    },
  ],
};
