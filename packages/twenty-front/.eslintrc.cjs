module.exports = {
  parser: '@typescript-eslint/parser',
  root: true,
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'twenty/effect-components': 'error',
    'twenty/no-hardcoded-colors': 'error',
    'twenty/matching-state-variable': 'error',
    'twenty/component-props-naming': 'error',
    'twenty/sort-css-properties-alphabetically': 'error',
    'twenty/styled-components-prefixed-with-styled': 'error',
    'twenty/no-state-useref': 'error',
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'no-unused-vars': 'off',
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
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@tabler/icons-react'],
            message: 'Icon imports are only allowed for `@/ui/icon`',
          },
          {
            group: ['react-hotkeys-web-hook'],
            importNames: ['useHotkeys'],
            message: 'Please use the custom wrapper: `useScopedHotkeys`',
          },
        ],
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'no-type-imports' },
    ],
    'no-console': ['warn', { allow: ['group', 'groupCollapsed', 'groupEnd'] }],
    // 'react-refresh/only-export-components': [
    //   'warn',
    //   { allowConstantExport: true },
    // ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'plugin:storybook/recommended',
  ],
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'simple-import-sort',
    'unused-imports',
    'prefer-arrow',
    'twenty',
    'react-refresh',
  ],
  ignorePatterns: [
    'mockServiceWorker.js',
    '**/generated*/*',
    '.eslintrc.cjs',
    '*.config.cjs',
    '*.config.ts',
    '*config.js',
    'codegen*',
  ],
  overrides: [
    {
      files: ['*.stories.tsx', '*.test.ts'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      rules: {
        'react/no-unescaped-entities': 'off',
        'react/prop-types': 'off',
        'react/jsx-key': 'off',
        'react/display-name': 'off',
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        'no-control-regex': 0,
        'no-undef': 'off',
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              ['^react', '^@?\\w'],
              ['^(@|~)(/.*|$)'],
              ['^\\u0000'],
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              ['^.+\\.?(css)$'],
            ],
          },
        ],
        'prefer-arrow/prefer-arrow-functions': [
          'error',
          {
            disallowPrototype: true,
            singleReturnOnly: false,
            classPropertiesAllowed: false,
          },
        ],
      },
    },
  ],
};
