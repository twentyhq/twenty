import { type JestConfigWithTsJest } from 'ts-jest';

const tsConfig = require('./tsconfig.e2e.json');

const jestConfig: JestConfigWithTsJest = {
  // For more information please have a look to official docs https://jestjs.io/docs/configuration/#prettierpath-string
  // Prettier v3 should be supported in jest v30 https://github.com/jestjs/jest/releases/tag/v30.0.0-alpha.1
  prettierPath: null,
  displayName: 'twenty-cli-e2e',
  silent: false,
  errorOnDeprecated: true,
  maxConcurrency: 1,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '\\.e2e-spec\\.ts$',
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/e2e/setup.ts'],
  globalTeardown: '<rootDir>/src/__tests__/e2e/teardown.ts',
  testTimeout: 30000, // 30 seconds timeout for e2e tests
  maxWorkers: 1,
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
          baseUrl: '.',
          paths: {
            'src/*': ['./src/*'],
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  fakeTimers: {
    enableGlobally: true,
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.e2e.json',
    },
  },
};

export default jestConfig;
