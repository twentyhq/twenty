import js from '@eslint/js';
import nxPlugin from '@nx/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import linguiPlugin from 'eslint-plugin-lingui';
import * as mdxPlugin from 'eslint-plugin-mdx';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // Lingui recommended rules
  linguiPlugin.configs['flat/recommended'],

  // Global ignores
  {
    ignores: ['**/node_modules/**'],
  },

  // Base configuration for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      prettier: prettierPlugin,
      lingui: linguiPlugin,
      '@nx': nxPlugin,
      'prefer-arrow': preferArrowPlugin,
      import: importPlugin,
      'unused-imports': unusedImportsPlugin,
      unicorn: unicornPlugin,
    },
    rules: {
      // General rules
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'no-console': [
        'warn',
        { allow: ['group', 'groupCollapsed', 'groupEnd'] },
      ],
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
              sourceTag: 'scope:apps',
              onlyDependOnLibsWithTags: ['scope:apps', 'scope:sdk'],
            },
            {
              sourceTag: 'scope:sdk',
              onlyDependOnLibsWithTags: ['scope:sdk', 'scope:shared'],
            },
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
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // TypeScript rules
      'no-redeclare': 'off', // Turn off base rule for TypeScript
      '@typescript-eslint/no-redeclare': 'error', // Use TypeScript-aware version
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
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
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // JavaScript specific configuration
  {
    files: ['*.{js,jsx}'],
    rules: {
      // JavaScript-specific rules if needed
    },
  },

  // Test files
  {
    files: [
      '*.spec.@(ts|tsx|js|jsx)',
      '*.integration-spec.@(ts|tsx|js|jsx)',
      '*.test.@(ts|tsx|js|jsx)',
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
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // JSON files
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
  },

  // MDX files
  {
    ...mdxPlugin.flat,
    plugins: {
      ...mdxPlugin.flat.plugins,
      '@nx': nxPlugin,
    },
  },
  mdxPlugin.flatCodeBlocks,
  {
    files: ['**/*.mdx'],
    rules: {
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
      // Enforce JSX tags on separate lines to prevent Crowdin translation issues
      '@nx/workspace-mdx-component-newlines': 'error',
      // Disallow angle bracket placeholders to prevent Crowdin translation errors
      '@nx/workspace-no-angle-bracket-placeholders': 'error',
    },
  },
];
