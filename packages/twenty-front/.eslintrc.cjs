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
        'project-structure/folder-structure-config-path': path.join(
          __dirname,
          'folderStructure.json',
        ),
      },
      rules: {
        'project-structure/folder-structure': 'error',
        /* 
        Uncomment this rule when we have a way to work on 
        'lingui/no-unlocalized-strings': [
          'error',
          {
            ignore: [
              '^(?![A-Z])\\S+$',
              '^[A-Z0-9_-]+$'
            ],
            ignoreNames: [
              { regex: { pattern: 'className', flags: 'i' } },
              { regex: { pattern: '^[A-Z0-9_-]+$' } },
              'styleName',
              'src',
              'srcSet', 
              'type',
              'id',
              'width',
              'height',
              'displayName',
              'Authorization'
            ],
            ignoreFunctions: [
              'cva',
              'cn',
              'track',
              'Error',
              'console.*',
              '*headers.set',
              '*.addEventListener',
              '*.removeEventListener',
              '*.postMessage',
              '*.getElementById',
              '*.dispatch',
              '*.commit',
              '*.includes',
              '*.indexOf',
              '*.endsWith',
              '*.startsWith',
              'require'
            ],
            useTsTypes: true,
            ignoreMethodsOnTypes: [
              'Map.get',
              'Map.has',
              'Set.has'
            ]
          }
        ]
          */
      },
    },
  ],
};
