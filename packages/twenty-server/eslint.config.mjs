import js from '@eslint/js';
import nxPlugin from '@nx/eslint-plugin';
import stylisticPlugin from '@stylistic/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import linguiPlugin from 'eslint-plugin-lingui';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import jsoncParser from 'jsonc-eslint-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // Lingui recommended rules
  linguiPlugin.configs['flat/recommended'],

  // Global ignores
  {
    ignores: [
      'packages/twenty-server/node_modules/**',
      'packages/twenty-server/dist/**',
      '**/node_modules/**',
      '**/.local-storage/**',
      'src/engine/workspace-manager/dev-seeder/data/constants/**',
      'src/engine/workspace-manager/dev-seeder/data/seeds/**',
      'src/utils/email-providers.ts',
      'src/engine/core-modules/i18n/locales/generated/**',
      'src/engine/core-modules/serverless/drivers/constants/base-typescript-project/src/index.ts',
      'packages/twenty-server/src/engine/core-modules/i18n/locales/**'
    ],
  },

  // Base configuration for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'prettier': prettierPlugin,
      'lingui': linguiPlugin,
      '@nx': nxPlugin,
      'prefer-arrow': preferArrowPlugin,
      'import': importPlugin,
      'unused-imports': unusedImportsPlugin,
      'unicorn': unicornPlugin,
      '@stylistic': stylisticPlugin,
    },
    rules: {
      'prettier/prettier': 'error',

      // General rules
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'no-console': ['warn', { allow: ['group', 'groupCollapsed', 'groupEnd'] }],
      'no-control-regex': 0,
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-undef': 'off',
      'no-unused-vars': 'off',

      // Nx rules
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:backend',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:backend'],
            },
            {
              sourceTag: 'scope:frontend',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:frontend'],
            },
            {
              sourceTag: 'scope:zapier',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],

      // Import rules
      'import/no-relative-packages': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-duplicates': ['error', { considerQueryString: true }],

      // Prefer arrow functions
      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],

      // Unused imports
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  // TypeScript specific configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: [path.resolve(__dirname, 'tsconfig.json')],
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports'
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'with-single-extends',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error', // Stricter for server
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Import restrictions
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
              message: "Please use the standalone lodash package (for instance: `import groupBy from 'lodash.groupby'` instead of `import { groupBy } from 'lodash'`)",
            },
          ],
        },
      ],

      // Stylistic rules
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

      // Import order
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

      // Disable conflicting rules
      'simple-import-sort/imports': 'off',
      'unicorn/filename-case': 'off',
      'prefer-arrow/prefer-arrow-functions': 'off',
      '@nx/workspace-max-consts-per-file': 'off',

      // Custom workspace rules
      '@nx/workspace-inject-workspace-repository': 'warn',
      '@nx/workspace-rest-api-methods-should-be-guarded': 'error',
      '@nx/workspace-graphql-resolvers-should-be-guarded': 'error',
    },
  },

  // Test files
  {
    files: [
      '**/*.spec.ts',
      '**/*.integration-spec.ts',
      '**/__tests__/**',
      '**/test/integration/**',
      '**/test/utils/**',
    ],
    languageOptions: {
      globals: {
        jest: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Scripts files
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: [path.resolve(__dirname, 'tsconfig.scripts.json')],
      },
    },
  },

  // JSON files
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
  },
];
