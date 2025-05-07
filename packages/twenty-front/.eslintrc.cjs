module.exports = {
  extends: ['../../.eslintrc.react.cjs'],
  ignorePatterns: [
    'node_modules',
    'mockServiceWorker.js',
    '**/generated*/*',
    '**/generated/standard-metadata-query-result.ts',
    'build',
    'coverage',
    'storybook-static',
    '**/*config.js',
    'jest.config.ts',
    'emotion.d.ts',
    'lingui.config.ts',
    'vite.config.ts',
    'setupTests.ts',
    'codegen*',
    '__mocks__',
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: ['packages/twenty-front/tsconfig.*.json'],
      },
    },
  ],
};
