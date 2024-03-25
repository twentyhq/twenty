const path = require('path');

module.exports = {
  extends: ['../../.eslintrc.js', '../../.eslintrc.react.js'],
  ignorePatterns: [
    '!**/*',
    'node_modules',
    'mockServiceWorker.js',
    '**/generated*/*',
    'tsup.config.ts',
    'build',
    'coverage',
    'storybook-static',
    '**/*config.js',
    'codegen*',
    'tsup.ui.index.tsx',
    '__mocks__',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['packages/twenty-front/tsconfig.{json,*.json}'],
      },
      rules: {},
    },
    {
      files: ['.storybook/main.@(js|cjs|mjs|ts)'],
      rules: {
        'storybook/no-uninstalled-addons': [
          'error',
          { packageJsonLocation: path.resolve('../../package.json') },
        ],
      },
    },
  ],
};
