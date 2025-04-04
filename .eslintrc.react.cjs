var path = require('path');

module.exports = {
  extends: [
    'plugin:@nx/react',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:storybook/recommended',
  ],
  plugins: ['react-hooks', 'react-refresh'],
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
  ],
};
