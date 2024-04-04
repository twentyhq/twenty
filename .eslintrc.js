module.exports = {
  root: true,
  extends: ['plugin:prettier/recommended'],
  plugins: [
    '@nx',
    'prefer-arrow',
    'simple-import-sort',
    'unused-imports',
    'unicorn',
  ],
  rules: {
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'no-console': ['warn', { allow: ['group', 'groupCollapsed', 'groupEnd'] }],
    'no-unused-vars': 'off',
    'no-control-regex': 0,
    'no-undef': 'off',

    '@nx/enforce-module-boundaries': [
      'error',
      {
        enforceBuildableLibDependency: true,
        allow: [],
        depConstraints: [
          {
            sourceTag: '*',
            onlyDependOnLibsWithTags: ['*'],
          },
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
    'simple-import-sort/exports': 'error',

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
      extends: ['plugin:@nx/typescript'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'error',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'no-type-imports' },
        ],
        '@typescript-eslint/no-empty-interface': [
          'error',
          { allowSingleExtends: true },
        ],
      },
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['plugin:@nx/javascript'],
      rules: {},
    },
    {
      files: ['*.spec.@(ts|tsx|js|jsx)', '*.test.@(ts|tsx|js|jsx)'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['*.stories.@(ts|tsx|js|jsx)'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
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
  ],
};
