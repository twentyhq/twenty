import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

const isBillingEnabled = process.env.IS_BILLING_ENABLED === 'true';
const isClickhouseEnabled = process.env.CLICKHOUSE_URL !== undefined;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfig = require('./tsconfig.json');

const jestConfig: JestConfigWithTsJest = {
  // For more information please have a look to official docs https://jestjs.io/docs/configuration/#prettierpath-string
  // Prettier v3 should be supported in jest v30 https://github.com/jestjs/jest/releases/tag/v30.0.0-alpha.1
  prettierPath: null,
  silent: false,
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    ...(isBillingEnabled ? [] : ['<rootDir>/test/integration/billing']),
    ...(isClickhouseEnabled ? [] : ['<rootDir>/test/integration/analytics']),
  ],
  testRegex: '\\.integration-spec\\.ts$',
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  globalSetup: '<rootDir>/test/integration/utils/setup-test.ts',
  globalTeardown: '<rootDir>/test/integration/utils/teardown-test.ts',
  testTimeout: 20000,
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
          experimental: {
            plugins: [
              [
                '@lingui/swc-plugin',
                {
                  stripNonEssentialFields: false,
                },
              ],
            ],
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
      prefix: '<rootDir>/../..',
    }),
    '^test/(.*)$': '<rootDir>/test/$1',
  },
  fakeTimers: {
    enableGlobally: true,
  },
  globals: {
    APP_PORT: 4000,
    NODE_ENV: NodeEnvironment.test,
    ADMIN_ACCESS_TOKEN:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC05ZTNiLTQ2ZDQtYTU1Ni04OGI5ZGRjMmIwMzQiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMDY4Ny00YzQxLWI3MDctZWQxYmZjYTk3MmE3IiwidXNlcldvcmtzcGFjZUlkIjoiMjAyMDIwMjAtOWUzYi00NmQ0LWE1NTYtODhiOWRkYzJiMDM1IiwiaWF0IjoxNzM5NTQ3NjYxLCJleHAiOjMzMjk3MTQ3NjYxfQ.fbOM9yhr3jWDicPZ1n771usUURiPGmNdeFApsgrbxOw',
    EXPIRED_ACCESS_TOKEN:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC05ZTNiLTQ2ZDQtYTU1Ni04OGI5ZGRjMmIwMzQiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMDY4Ny00YzQxLWI3MDctZWQxYmZjYTk3MmE3IiwiaWF0IjoxNzM4MzIzODc5LCJleHAiOjE3MzgzMjU2Nzl9.m73hHVpnw5uGNGrSuKxn6XtKEUK3Wqkp4HsQdYfZiHo',
    INVALID_ACCESS_TOKEN:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC05ZTNiLTQ2ZDQtYTU1Ni04OGI5ZGRjMmIwMzQiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMDY4Ny00YzQxLWI3MDctZWQxYmZjYTk3MmE3IiwiaWF0IjoxNzM4MzIzODc5LCJleHAiOjE3MzgzMjU2Nzl9.m73hHVpnw5uGNGrSuKxn6XtKEUK3Wqkp4HsQdYfZiHp',
    MEMBER_ACCESS_TOKEN:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0zOTU3LTQ5MDgtOWMzNi0yOTI5YTIzZjgzNTciLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtNzdkNS00Y2I2LWI2MGEtZjRhODM1YTg1ZDYxIiwidXNlcldvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMzk1Ny00OTA4LTljMzYtMjkyOWEyM2Y4MzUzIiwiaWF0IjoxNzM5NDU5NTcwLCJleHAiOjMzMjk3MDU5NTcwfQ.Er7EEU4IP4YlGN79jCLR_6sUBqBfKx2M3G_qGiDpPRo',
    GUEST_ACCESS_TOKEN:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC03MTY5LTQyY2YtYmM0Ny0xY2ZlZjE1MjY0YjgiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMTU1My00NWM2LWEwMjgtNWE5MDY0Y2NlMDdmIiwidXNlcldvcmtzcGFjZUlkIjoiMjAyMDIwMjAtNzE2OS00MmNmLWJjNDctMWNmZWYxNTI2NGIxIiwiaWF0IjoxNzM5ODg4NDcwLCJleHAiOjMzMjk3NDg4NDcwfQ.0NEu-AWGv3l77rs-56Z5Gt0UTU7HDl6qUTHUcMWNrCc',
    API_KEY_ACCESS_TOKEN:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNzQ0OTgzNzUwLCJleHAiOjQ4OTg1ODM2OTMsImp0aSI6IjIwMjAyMDIwLWY0MDEtNGQ4YS1hNzMxLTY0ZDAwN2MyN2JhZCJ9.4xkkwz_uu2xzs_V8hJSaM15fGziT5zS3vq2lM48OHr0',
  },
};

export default jestConfig;
