var path = require('path');

module.exports = {
  extends: [
    'plugin:@nx/react',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:storybook/recommended',
    'plugin:prettier/recommended',
    'plugin:lingui/recommended',
    'plugin:@nx/typescript'
  ],
  plugins: ['react-hooks', 'react-refresh', '@nx', 'prefer-arrow', 'import', 'unused-imports', 'unicorn', 'lingui'],
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
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
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
    {
      files: ['*.stories.@(ts|tsx|js|jsx)'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
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
    {
      files: ['*.js', '*.jsx'],
      extends: ['plugin:@nx/javascript'],
      rules: {},
    },
    {
      files: [
        '*.test.@(ts|tsx|js|jsx)',
      ],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
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
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',
    },
  ],
};
