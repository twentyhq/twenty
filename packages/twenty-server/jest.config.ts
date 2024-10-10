import { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  // to enable logs, comment out the following line
  silent: true,
  clearMocks: true,
  displayName: 'twenty-server',
  rootDir: './',
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  fakeTimers: {
    enableGlobally: true,
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
};

export default jestConfig;
