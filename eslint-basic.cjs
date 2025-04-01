const TYPESCRIPT_RULES = {
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'no-type-imports' },
  ],
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/interface-name-prefix': 'off',
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
};
