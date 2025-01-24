import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';

const isBillingEnabled = process.env.IS_BILLING_ENABLED === 'true';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfig = require('./tsconfig.json');

const jestConfig: JestConfigWithTsJest = {
  silent: false,
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: isBillingEnabled
    ? 'integration-spec.ts'
    : '^(?!.*billing).*\\.integration-spec\\.ts$',
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  globalSetup: '<rootDir>/test/integration/utils/setup-test.ts',
  globalTeardown: '<rootDir>/test/integration/utils/teardown-test.ts',
  testTimeout: 15000,
  maxWorkers: 1,
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
      prefix: '<rootDir>/../..',
    }),
    '^test/(.*)$': '<rootDir>/test/$1',
    'twenty-emails': '<rootDir>/../twenty-emails/dist/index.js',
    'twenty-shared': '<rootDir>/../twenty-shared/dist/index.js',
  },
  fakeTimers: {
    enableGlobally: true,
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  globals: {
    APP_PORT: 4000,
    ACCESS_TOKEN:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC05ZTNiLTQ2ZDQtYTU1Ni04OGI5ZGRjMmIwMzQiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMDY4Ny00YzQxLWI3MDctZWQxYmZjYTk3MmE3IiwiaWF0IjoxNzI2NDkyNTAyLCJleHAiOjEzMjQ1MDE2NTAyfQ._ISjY_dlVWskeQ6wkE0-kOn641G_mee5GiqoZTQFIfE',
  },
};

export default jestConfig;
