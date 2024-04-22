module.exports = {
  extends: ['../../.eslintrc.cjs', '../../.eslintrc.react.cjs'],
  ignorePatterns: ['!**/*', 'node_modules', 'dist', 'src/generated/*.tsx'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['packages/twenty-chrome-extension/tsconfig.{json,*.json}'],
      },
      rules: {
        '@nx/workspace-explicit-boolean-predicates-in-if': 'warn',
      },
    },
  ],
};
