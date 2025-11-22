import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { pathsToModuleNameMapper } from 'ts-jest';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tsConfigPath = resolve(__dirname, './tsconfig.spec.json');
const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf8'));

// eslint-disable-next-line no-undef
process.env.TZ = 'GMT';
// eslint-disable-next-line no-undef
process.env.LC_ALL = 'en_US.UTF-8';
const jestConfig = {
  silent: true,
  // For more information please have a look to official docs https://jestjs.io/docs/configuration/#prettierpath-string
  // Prettier v3 will should be supported in jest v30 https://github.com/jestjs/jest/releases/tag/v30.0.0-alpha.1
  prettierPath: null,
  displayName: 'twenty-front',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['./setupTests.ts'],
  testEnvironment: 'jsdom',

  transformIgnorePatterns: [
    '/node_modules/(?!(twenty-ui)/.*)',
    '../../node_modules/(?!(twenty-ui)/.*)',
    '../../twenty-ui/',
  ],
  transform: {
    '^.+\\.(ts|js|tsx|jsx)$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
          experimental: {
            plugins: [['@lingui/swc-plugin', {}]],
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg|svg\\?react)$':
      '<rootDir>/__mocks__/imageMockFront.js',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
      prefix: '<rootDir>/../../',
    }),
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  coverageThreshold: {
    global: {
      statements: 51,
      lines: 50,
      functions: 41,
    },
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    'states/.+State.ts$',
    'states/selectors/*',
    'contexts/.+Context.ts',
    'testing/*',
    'tests/*',
    'config/*',
    'graphql/queries/*',
    'graphql/mutations/*',
    'graphql/subscriptions/*',
    'graphql/fragments/*',
    'types/*',
    'constants/*',
    'generated-metadata/*',
    'generated/*',
    '__stories__/*',
    'display/icon/index.ts',
  ],
  coverageDirectory: './coverage',
  maxWorkers: '50%',
  errorOnDeprecated: true,
};

export default jestConfig;
