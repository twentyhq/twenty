import dotenv from 'dotenv';
import { type JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import testTokens from './test/integration/constants/test-tokens.json';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test', override: true });
} else {
  dotenv.config({ path: '.env', override: true });
}

const isBillingEnabled = process.env.IS_BILLING_ENABLED === 'true';
const isClickhouseEnabled = process.env.CLICKHOUSE_URL !== undefined;

const tsConfig = require('./tsconfig.json');

const jestConfig: JestConfigWithTsJest = {
  // Prettier v3 is only supported from jest v30 (https://github.com/jestjs/jest/releases/tag/v30.0.0-alpha.1)
  prettierPath: null,
  silent: false,
  errorOnDeprecated: true,
  maxConcurrency: 1,
  moduleFileExtensions: ['js', 'mjs', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    ...(isBillingEnabled ? [] : ['<rootDir>/test/integration/billing']),
    ...(isClickhouseEnabled ? [] : ['<rootDir>/test/integration/audit']),
    // Needs a secure-deployment app; runs via jest-integration-secure.config.ts (nx test:integration:secure)
    '<rootDir>/test/integration/secure-deployment',
  ],
  testRegex: '\\.integration-spec\\.ts$',
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  globalSetup: '<rootDir>/test/integration/utils/setup-test.ts',
  globalTeardown: '<rootDir>/test/integration/utils/teardown-test.ts',
  setupFilesAfterEnv: [
    '<rootDir>/test/integration/utils/setup-wait-for-all-jobs-between-tests.ts',
  ],
  testTimeout: 20000,
  maxWorkers: 1,
  // ESM-only deps (jsdom 29 and msw chains, ai, @ai-sdk/*, @workflow/serde) that swc must transform for jest
  transformIgnorePatterns: [
    '/node_modules/(?!(.*/node_modules/)?(jsdom|html-encoding-sniffer|whatwg-encoding|@exodus|parse5|entities|tough-cookie|@csstools|@asamuzakjp|msw|@mswjs|until-async|@bundled-es-modules|@open-draft|strict-event-emitter|headers-polyfill|outvariant|is-node-process|path-to-regexp|statuses|cookie|digest-fetch|md5|email-reply-parser|ai|@ai-sdk|@workflow|htmlparser2|marked|domhandler|domutils|dom-serializer|domelementtype|@faker-js)/)',
  ],
  transform: {
    '^.+\\.(t|j|mj)s$': [
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
  globals: {
    APP_PORT: 4000,
    NODE_ENV: NodeEnvironment.TEST,
    ...testTokens,
  },
};

export default jestConfig;
