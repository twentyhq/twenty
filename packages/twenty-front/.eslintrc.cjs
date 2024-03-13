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
  ignorePatterns: [
    '!**/*',
    'node_modules',
    'mockServiceWorker.js',
    '**/generated*/*',
    'tsup.config.ts',
    'build',
    'coverage',
    'storybook-static',
    '**/*config.js',
    'codegen*',
    'tsup.ui.index.tsx',
    '__mocks__',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@tabler/icons-react'],
            message: 'Icon imports are only allowed for `@/ui/display/icon`',
          },
          {
            group: ['react-hotkeys-web-hook'],
            importNames: ['useHotkeys'],
            message: 'Please use the custom wrapper: `useScopedHotkeys`',
          },
        ],
      },
    ],
    'no-extra-boolean-cast': 'off',

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
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      parserOptions: {
        project: ['packages/twenty-front/tsconfig.{json,*.json}'],
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
