export default {
  // to enable logs, comment out the following line
  silent: true,
  setupFilesAfterEnv: ['./src/setupTests.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|js|tsx|jsx)$': '@swc/jest',
  },
  moduleNameMapper: {
    '~/(.+)': '<rootDir>/src/$1',
    '@/(.+)': '<rootDir>/src/modules/$1',
    'twenty-ui': '<rootDir>/../twenty-ui/src/index.ts',
    '@testing/(.+)': '<rootDir>/src/testing/$1',
    '\\.(jpg|jpeg|png|gif|webp|svg|svg\\?react)$':
      '<rootDir>/__mocks__/imageMock.js',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  coverageThreshold: {
    global: {
      statements: 65,
      lines: 65,
      functions: 55,
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
    'graphql/fragments/*',
    'types/*',
    'constants/*',
    'generated-metadata/*',
    'generated/*',
    '__stories__/*',
    'display/icon/index.ts',
  ],
  // coverageDirectory: '<rootDir>/coverage/',
};
