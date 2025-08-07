import nxPlugin from '@nx/eslint-plugin';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import linguiPlugin from 'eslint-plugin-lingui';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import jsoncEslintParser from 'jsonc-eslint-parser';

export const globalConfig = [
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
    plugins: {
      '@nx': nxPlugin,
      'prefer-arrow': preferArrowPlugin,
      import: importPlugin,
      'unused-imports': unusedImportsPlugin,
      unicorn: unicornPlugin,
      lingui: linguiPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'lingui/no-single-variables-to-translate': 'off',
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'no-console': ['warn', { allow: ['group', 'groupCollapsed', 'groupEnd'] }],
      'no-control-regex': 0,
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-undef': 'off',
      'no-unused-vars': 'off',

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

      'import/no-relative-packages': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-duplicates': ['error', { considerQueryString: true }],

      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],

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

  // TypeScript specific config
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
    },
    rules: {
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
      '@typescript-eslint/no-empty-interface': [
        'error',
        {
          allowSingleExtends: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': [
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

  // JavaScript specific config
  {
    files: ['*.js', '*.jsx'],
    // Note: plugin:@nx/javascript rules would need to be expanded here
    rules: {},
  },

  // Test files config
  {
    files: [
      '*.spec.@(ts|tsx|js|jsx)',
      '*.integration-spec.@(ts|tsx|js|jsx)',
      '*.test.@(ts|tsx|js|jsx)',
    ],
    languageOptions: {
      globals: {
        jest: true,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Constants files config
  {
    files: ['**/constants/*.ts', '**/*.constants.ts'],
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

  // JSON files config
  {
    files: ['*.json'],
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
];