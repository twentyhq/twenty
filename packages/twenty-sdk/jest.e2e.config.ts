import { type JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  // For more information please have a look to official docs https://jestjs.io/docs/configuration/#prettierpath-string
  // Prettier v3 should be supported in jest v30 https://github.com/jestjs/jest/releases/tag/v30.0.0-alpha.1
  prettierPath: null,
  displayName: 'twenty-sdk-e2e',
  silent: false,
  errorOnDeprecated: true,
  maxConcurrency: 1,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '\\.e2e-spec\\.ts$',
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  globalTeardown: '<rootDir>/src/cli/__tests__/e2e/teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/src/cli/__tests__/e2e/setupTest.ts'],
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
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|inquirer|@inquirer|ansi-styles|strip-ansi|has-flag|supports-color|color-convert|color-name|wrap-ansi|string-width|is-fullwidth-code-point|emoji-regex|onetime|mimic-fn|signal-exit|yallist|lru-cache|p-limit|p-queue|p-timeout|p-finally|p-try|p-cancelable|p-locate|p-map|p-race|p-reduce|p-some|p-waterfall|p-defer|p-delay|p-retry|p-any|p-settle|p-all|p-map-series|p-map-concurrent|p-filter|p-reject|p-tap|p-log|p-debounce|p-throttle|p-forever|p-whilst|p-do-whilst|p-until|p-wait-for|p-min-delay)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default jestConfig;
