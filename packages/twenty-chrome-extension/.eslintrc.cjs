module.exports = {
  root: true,
  extends: ['../../.eslintrc.global.cjs', '../../.eslintrc.react.cjs'],
  ignorePatterns: [
    'node_modules',
    'dist',
    '**/generated/*',
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: ['packages/twenty-chrome-extension/tsconfig.*.json'],
      },
      rules: {
        '@nx/workspace-explicit-boolean-predicates-in-if': 'warn',
      },
    },
  ],
};
