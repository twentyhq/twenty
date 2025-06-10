module.exports = {
  extends: ['../../.eslintrc.global.cjs', '../../.eslintrc.react.cjs'],
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
