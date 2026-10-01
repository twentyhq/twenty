import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const isCI = process.env.CI === 'true';

const jestConfig = {
  // Prettier v3 is only supported from jest v30 (https://github.com/jestjs/jest/releases/tag/v30.0.0-alpha.1)
  prettierPath: null,
  // to enable logs, comment out the following line
  silent: true,
  ...(isCI && { reporters: ['./jest-failures-only-reporter.js'] }),
  errorOnDeprecated: true,
  clearMocks: true,
  displayName: 'twenty-server',
  rootDir: './',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./setupTests.ts'],
  transformIgnorePatterns: [
    // ESM-only deps jest's CJS runtime cannot load; (.*/node_modules/)? also matches nested copies like sanitize-html's htmlparser2
    '/node_modules/(?!(.*/node_modules/)?(file-type|@file-type|strtok3|token-types|@borewit|@tokenizer|uint8array-extras|read-next-line|digest-fetch|md5|js-sha256|js-sha512|base-64|charenc|crypt|email-reply-parser|jsdom|html-encoding-sniffer|whatwg-encoding|@exodus|parse5|entities|tough-cookie|@csstools|@asamuzakjp|graphql-upload|fs-capacitor|e2b|@e2b|chalk|ai|@ai-sdk|@workflow|htmlparser2|domhandler|domutils|dom-serializer|domelementtype|@faker-js|twenty-oxlint-rules)/)',
  ],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    // include .mjs so swc transforms ESM-only deps (e.g. jsdom's @csstools/* .mjs)
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
    '^src/(.*)': '<rootDir>/src/$1',
    '^test/(.*)': '<rootDir>/test/$1',
    '^file-type$': require.resolve('file-type'),
  },
  moduleFileExtensions: ['js', 'mjs', 'json', 'ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  fakeTimers: {
    enableGlobally: true,
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
};

export default jestConfig;
