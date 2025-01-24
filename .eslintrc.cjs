module.exports = {
  root: true,
  extends: ['plugin:prettier/recommended', 'plugin:lingui/recommended'],
  plugins: [
    '@nx',
    'prefer-arrow',
    'import',
    'unused-imports',
    'unicorn',
    'lingui',
  ],
  rules: {
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
      extends: ['plugin:@nx/typescript'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'error',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'no-type-imports' },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': [
          'error',
          {
            allowSingleExtends: true,
          },
        ],
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
      },
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['plugin:@nx/javascript'],
      rules: {},
    },
    {
      files: [
        '*.spec.@(ts|tsx|js|jsx)',
        '*.integration-spec.@(ts|tsx|js|jsx)',
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
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',
    },
  ],
};
