import js from '@eslint/js';
import nxPlugin from '@nx/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import linguiPlugin from 'eslint-plugin-lingui';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // Lingui recommended rules
  linguiPlugin.configs['flat/recommended'],

  // Base configuration for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      'prettier': prettierPlugin,
      'lingui': linguiPlugin,
      '@nx': nxPlugin,
      'prefer-arrow': preferArrowPlugin,
      'import': importPlugin,
      'unused-imports': unusedImportsPlugin,
      'unicorn': unicornPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // General rules
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'no-console': ['warn', { allow: ['group', 'groupCollapsed', 'groupEnd'] }],
      'no-control-regex': 0,
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'prettier/prettier': 'error',

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

      // React rules
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'react/jsx-key': 'off',
      'react/display-name': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'react/jsx-props-no-spreading': [
        'error',
        {
          explicitSpread: 'ignore',
        },
      ],

      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: 'useRecoilCallback',
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
        // Note: project path should be specified by each package individually
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Import restrictions
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@tabler/icons-react'],
              message: 'Please import icons from `twenty-ui`',
            },
            {
              group: ['react-hotkeys-web-hook'],
              importNames: ['useHotkeys'],
              message: 'Please use the custom wrapper: `useScopedHotkeys` from `twenty-ui`',
            },
            {
              group: ['lodash'],
              message: "Please use the standalone lodash package (for instance: `import groupBy from 'lodash.groupby'` instead of `import { groupBy } from 'lodash'`)",
            },
          ],
        },
      ],

      // TypeScript rules
      'no-redeclare': 'off', // Turn off base rule for TypeScript
      '@typescript-eslint/no-redeclare': 'error', // Use TypeScript-aware version
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
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Custom workspace rules
      '@nx/workspace-effect-components': 'error',
      '@nx/workspace-no-hardcoded-colors': 'error',
      '@nx/workspace-matching-state-variable': 'error',
      '@nx/workspace-sort-css-properties-alphabetically': 'error',
      '@nx/workspace-styled-components-prefixed-with-styled': 'error',
      '@nx/workspace-no-state-useref': 'error',
      '@nx/workspace-component-props-naming': 'error',
      '@nx/workspace-explicit-boolean-predicates-in-if': 'error',
      '@nx/workspace-use-getLoadable-and-getValue-to-get-atoms': 'error',
      '@nx/workspace-useRecoilCallback-has-dependency-array': 'error',
      '@nx/workspace-no-navigate-prefer-link': 'error',
    },
  },

  // Storybook files
  {
    files: ['*.stories.@(ts|tsx|js|jsx)'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // JavaScript specific configuration
  {
    files: ['*.{js,jsx}'],
    rules: {
      // JavaScript-specific rules if needed
    },
  },

  // Constants files
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

  // Test files
  {
    files: [
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

  // Constants files
  {
    files: ['**/*.constants.ts'],
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

  // JSON files
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
  },
];
