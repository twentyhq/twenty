import path from 'path';
import { fileURLToPath } from 'url';

import nxPlugin from '@nx/eslint-plugin';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import linguiPlugin from 'eslint-plugin-lingui';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import storybookPlugin from 'eslint-plugin-storybook';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const reactConfig = [
  // Base React config
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      '@nx': nxPlugin,
      'prefer-arrow': preferArrowPlugin,
      import: importPlugin,
      'unused-imports': unusedImportsPlugin,
      unicorn: unicornPlugin,
      lingui: linguiPlugin,
      storybook: storybookPlugin,
      prettier: prettierPlugin,
      react: reactPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'storybook/no-renderer-packages': 'off', // TODO: Remove this once we upgrade to Storybook 9
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
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
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
              message:
                'Please use the custom wrapper: `useScopedHotkeys` from `twenty-ui`',
            },
            {
              group: ['lodash'],
              message:
                "Please use the standalone lodash package (for instance: `import groupBy from 'lodash.groupby'` instead of `import { groupBy } from 'lodash'`)",
            },
          ],
        },
      ],
      '@typescript-eslint/no-empty-interface': [
        'error',
        {
          allowSingleExtends: true,
        },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
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
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: 'useRecoilCallback',
        },
      ],
    },
  },

  // Storybook files specific config
  {
    files: ['*.stories.@(ts|tsx|js|jsx)'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Storybook main config specific
  {
    files: ['.storybook/main.@(js|cjs|mjs|ts)'],
    rules: {
      'storybook/no-uninstalled-addons': [
        'error',
        {
          packageJsonLocation: path.resolve(__dirname, './package.json'),
        },
      ],
    },
  },

  // JavaScript files config
  {
    files: ['*.js', '*.jsx'],
    // Equivalent to extends: ['plugin:@nx/javascript']
    rules: {},
  },

  // Test files config
  {
    files: ['*.test.@(ts|tsx|js|jsx)'],
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

  // JSON files config
  {
    files: ['*.json'],
    languageOptions: {
      parser: 'jsonc-eslint-parser',
    },
  },
];