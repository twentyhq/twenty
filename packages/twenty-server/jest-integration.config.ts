import dotenv from 'dotenv';
import { type JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import testTokens from './test/integration/constants/test-tokens.json';

// Load .env vars at jest boot time
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test', override: true });
} else {
  dotenv.config({ path: '.env', override: true });
}

const isBillingEnabled = process.env.IS_BILLING_ENABLED === 'true';
const isClickhouseEnabled = process.env.CLICKHOUSE_URL !== undefined;

const tsConfig = require('./tsconfig.json');

const jestConfig: JestConfigWithTsJest = {
  // For more information please have a look to official docs https://jestjs.io/docs/configuration/#prettierpath-string
  // Prettier v3 should be supported in jest v30 https://github.com/jestjs/jest/releases/tag/v30.0.0-alpha.1
  prettierPath: null,
  silent: false,
  errorOnDeprecated: true,
  maxConcurrency: 1,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    ...(isBillingEnabled ? [] : ['<rootDir>/test/integration/billing']),
    ...(isClickhouseEnabled ? [] : ['<rootDir>/test/integration/audit']),
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
          baseUrl: '.',
          paths: {
            'src/*': ['./src/*'],
            'test/*': ['./test/*'],
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
      prefix: '<rootDir>/',
    }),
    '^test/(.*)$': '<rootDir>/test/$1',
  },
  fakeTimers: {
    enableGlobally: true,
  },
  globals: {
    APP_PORT: 4000,
    NODE_ENV: NodeEnvironment.TEST,
    // Test tokens are loaded from a shared JSON file to ensure consistency
    // with CI workflows and other tools that need these tokens
    ...testTokens,
  },
};

export default jestConfig;
