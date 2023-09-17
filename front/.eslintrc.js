module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'unused-imports',
    'simple-import-sort',
    'prefer-arrow',
    'twenty-ts',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:storybook/recommended',
    'react-app',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      rules: {
        'no-control-regex': 0,
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              ['^react', '^@?\\w'],
              ['^(@|~)(/.*|$)'],
              ['^\\u0000'],
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              ['^.+\\.?(css)$']
            ]
          }
        ],
        'prefer-arrow/prefer-arrow-functions': [
          'error',
          {
            "disallowPrototype": true,
            "singleReturnOnly": false,
            "classPropertiesAllowed": false
          }
        ]
      }
    },
  ],
  ignorePatterns: ['.eslintrc.js', 'codegen.js', '**/generated/*', '*.config.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'twenty-ts/effect-components': 'error',
    'twenty-ts/no-hardcoded-colors': 'error',
    'twenty-ts/matching-state-variable': 'error',
    'twenty-ts/sort-css-properties-alphabetically': 'error',
    'twenty-ts/styled-components-prefixed-with-styled': 'error',
    'func-style':['error', 'declaration', { 'allowArrowFunctions': true }],
    "@typescript-eslint/no-unused-vars": "off",
    "no-unused-vars": "off",
    "react-hooks/exhaustive-deps": [
      "warn", {
        "additionalHooks": "useRecoilCallback"
      }
    ],
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": [
      "warn",
      { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
    ],
    'no-restricted-imports': [
      'error',
      {
        'patterns': [
          {
            'group': ['@tabler/icons-react'],
            'message': 'Icon imports are only allowed for `@/ui/icon`',
          },
        ],
      },
    ],
  }
};
