module.exports = {
  extends: ['../../.eslintrc.react.cjs'],
  ignorePatterns: [
    'node_modules',
    'mockServiceWorker.js',
    '**/generated*/*',

    'build',
    'coverage',
    'storybook-static',
    '**/*config.js',

    'jest.config.ts',
    'lingui.config.ts',
    'vite.config.ts',
    'setupTests.ts',
    '**/__mocks__/**',
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: ['packages/twenty-front/tsconfig.dev.json'],
      },
    },
  ],
};
