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
    'twenty',
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
      files: ['*.stories.tsx', '*.test.ts'],
      rules: {
        'no-console': 'off',
      }
    },
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
    'twenty/effect-components': 'error',
    'twenty/no-hardcoded-colors': 'error',
    'twenty/no-spread-props': 'error',
    'twenty/matching-state-variable': 'error',
    'twenty/sort-css-properties-alphabetically': 'error',
    'twenty/styled-components-prefixed-with-styled': 'error',
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
          {
            'group': ['react-hotkeys-hook'],
            "importNames": ["useHotkeys"],
            'message': 'Please use the custom wrapper: `useScopedHotkeys`',
          },
        ],
      },
    ],
    "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "no-type-imports" }],
    'no-console': ['error', { allow: ['group', 'groupCollapsed', 'groupEnd'] }],
  }
};
