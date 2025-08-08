module.exports = {
  plugins: ['@stylistic'],
  extends: ['../../.eslintrc.global.cjs'],
  ignorePatterns: [
    'src/engine/workspace-manager/dev-seeder/data/constants/**',
    'src/engine/workspace-manager/dev-seeder/data/seeds/**',
    'src/utils/email-providers.ts',
    'src/engine/core-modules/i18n/locales/generated/**',
    'src/engine/core-modules/serverless/drivers/constants/base-typescript-project/src/index.ts',
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      parserOptions: {
        project: ['packages/twenty-server/tsconfig.json'],
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**../'],
                message: 'Relative imports are not allowed.',
              },
              {
                group: ['lodash'],
                message:
                  "Please use the standalone lodash package (for instance: `import groupBy from 'lodash.groupby'` instead of `import { groupBy } from 'lodash'`)",
              },
            ],
          },
        ],

        '@stylistic/linebreak-style': ['error', 'unix'],
        '@stylistic/lines-between-class-members': [
          'error',
          {
            enforce: [{ blankLine: 'always', prev: 'method', next: 'method' }],
          },
        ],
        '@stylistic/padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: '*', next: 'return' },
          { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
          {
            blankLine: 'any',
            prev: ['const', 'let', 'var'],
            next: ['const', 'let', 'var'],
          },
          { blankLine: 'always', prev: '*', next: ['interface', 'type'] },
        ],

        'import/order': [
          'error',
          {
            'newlines-between': 'always',
            groups: [
              'builtin',
              'external',
              'internal',
              'type',
              'parent',
              'sibling',
              'object',
              'index',
            ],
            pathGroups: [
              {
                pattern: '@nestjs/**',
                group: 'builtin',
                position: 'before',
              },
              {
                pattern: '**/interfaces/**',
                group: 'type',
                position: 'before',
              },
              {
                pattern: 'src/**',
                group: 'parent',
                position: 'before',
              },
              {
                pattern: './*',
                group: 'sibling',
                position: 'before',
              },
            ],
            distinctGroup: true,
            warnOnUnassignedImports: true,
            pathGroupsExcludedImportTypes: ['@nestjs/**'],
          },
        ],
        'simple-import-sort/imports': 'off',
        'unicorn/filename-case': 'off',
        'prefer-arrow/prefer-arrow-functions': 'off',
        '@nx/workspace-max-consts-per-file': 'off',
        '@nx/workspace-inject-workspace-repository': 'warn',
        '@nx/workspace-rest-api-methods-should-be-guarded': 'error',
        '@nx/workspace-graphql-resolvers-should-be-guarded': 'error',
      },
    },
    {
      files: [
        '**/*.spec.ts',
        '**/*.integration-spec.ts',
        '**/__tests__/**',
        '**/test/integration/**',
        '**/test/utils/**',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['scripts/**/*.ts'],
      parserOptions: {
        project: ['packages/twenty-server/tsconfig.scripts.json'],
      },
    },
  ],
};
