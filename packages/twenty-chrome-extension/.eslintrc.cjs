// eslint-disable-next-line
const path = require('path');

module.exports = {
  extends: [
    'plugin:@nx/react',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:storybook/recommended',
    '../../.eslintrc.js',
  ],
  plugins: ['react-hooks', 'react-refresh'],
  ignorePatterns: ['!**/*', 'node_modules', 'dist', 'src/generated/*.tsx'],
  rules: {
    '@nx/workspace-effect-components': 'error',
    '@nx/workspace-no-hardcoded-colors': 'error',
    '@nx/workspace-matching-state-variable': 'error',
    '@nx/workspace-sort-css-properties-alphabetically': 'error',
    '@nx/workspace-styled-components-prefixed-with-styled': 'error',
    '@nx/workspace-no-state-useref': 'error',
    '@nx/workspace-component-props-naming': 'error',

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
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      parserOptions: {
        project: ['packages/twenty-chrome-extension/tsconfig.*?.json'],
      },
      rules: {},
    },
    {
      files: ['.storybook/main.@(js|cjs|mjs|ts)'],
      rules: {
        'storybook/no-uninstalled-addons': [
          'error',
          { packageJsonLocation: path.resolve('../../package.json') },
        ],
      },
    },
    {
      files: ['.storybook/**/*', '**/*.stories.tsx', '**/*.test.@(ts|tsx)'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
