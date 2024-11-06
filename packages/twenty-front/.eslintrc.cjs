const path = require('path');

module.exports = {
  extends: ['../../.eslintrc.cjs', '../../.eslintrc.react.cjs'],
  ignorePatterns: [
    '!**/*',
    'node_modules',
    'mockServiceWorker.js',
    '**/generated*/*',
    '**/generated/standard-metadata-query-result.ts',
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
      plugins: ['project-structure'],
      settings: {
        'project-structure/folder-structure-config-path':path.resolve(
          __dirname,
          'folderStructure.json'
        )
      },
      rules: {
        'project-structure/folder-structure': 'error',
      },
    },
  ],
};
