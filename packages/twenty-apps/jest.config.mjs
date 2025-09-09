const jestConfig = {
  // For more information please have a look to official docs https://jestjs.io/docs/configuration/#prettierpath-string
  // Prettier v3 should be supported in jest v30 https://github.com/jestjs/jest/releases/tag/v30.0.0-alpha.1
  prettierPath: null,
  // to enable logs, comment out the following line
  silent: true,
  errorOnDeprecated: true,
  clearMocks: true,
  displayName: 'twenty-apps',
  rootDir: './',
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: false,
            decorators: true,
          },
          transform: {
            decoratorMetadata: true,
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    '^scripts/(.*)': '<rootDir>/scripts/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  collectCoverageFrom: [
    'scripts/**/*.ts',
    '!scripts/list-apps.ts',
  ],
  coverageDirectory: './coverage',
};

export default jestConfig;
