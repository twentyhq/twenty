import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfig = require('./tsconfig.json');

const jestConfig: JestConfigWithTsJest = {
  // to enable logs, comment out the following line
  silent: true,
  displayName: 'twenty-server',
  clearMocks: true,
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  transformIgnorePatterns: ['../../node_modules/'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths),
  },
  rootDir: './',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  fakeTimers: {
    enableGlobally: true,
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageDirectory: './coverage',
};

export default jestConfig;
