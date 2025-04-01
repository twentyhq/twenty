const path = require('path');
const { REACT_RULES, STORIES_RULES, STORYBOOK_RULES } = require(
  path.resolve(__dirname, '../../eslint-react.cjs'),
);
const { TYPESCRIPT_RULES } = require(
  path.resolve(__dirname, '../../eslint-basic.cjs'),
);

module.exports = {
  root: true, // To check
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
      files: [
        'packages/twenty-front/**/*.ts',
        'packages/twenty-front/**/*.tsx',
      ],
      extends: ['plugin:@nx/typescript'],
      parserOptions: {
        project: [
          'packages/twenty-front/tsconfig.dev.json',
          'packages/twenty-front/tsconfig.json',
          'packages/twenty-front/tsconfig.storybook.json',
          'packages/twenty-front/tsconfig.spec.json',
          'packages/twenty-front/tsconfig.build.json',
        ],
      },
      plugins: ['project-structure'],
      settings: {
        'project-structure/folder-structure-config-path': path.join(
          __dirname,
          'folderStructure.json',
        ),
      },
      rules: {
        ...REACT_RULES,
        ...TYPESCRIPT_RULES,
        'project-structure/folder-structure': 'error',
      },
    },
    {
      files: ['packages/twenty-front/**/*.stories.@(ts|tsx|js|jsx)'],
      rules: {
        ...STORIES_RULES,
      },
    },
    {
      files: ['packages/twenty-front/**/.storybook/main.@(js|cjs|mjs|ts)'],
      rules: {
        ...STORYBOOK_RULES,
      },
    },
    {
      files: ['packages/twenty-front/**/*.js', 'packages/twenty-front/**/*.jsx'],
      extends: ['plugin:@nx/javascript'],
      rules: {},
    },
    {
      files: [
        'packages/twenty-front/**/*.spec.@(ts|tsx|js|jsx)',
        'packages/twenty-front/**/*.integration-spec.@(ts|tsx|js|jsx)',
        'packages/twenty-front/**/*.test.@(ts|tsx|js|jsx)',
      ],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['packages/twenty-front/**/constants/*.ts', 'packages/twenty-front/**/*.constants.ts'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            format: ['UPPER_CASE'],
          },
        ],
        'unicorn/filename-case': [
          'warn',
          {
            cases: {
              pascalCase: true,
            },
          },
        ],
        '@nx/workspace-max-consts-per-file': ['error', { max: 1 }],
      },
    },
    {
      files: ['packages/twenty-front/**/*.json'],
      parser: 'jsonc-eslint-parser',
    },
  ],
};
