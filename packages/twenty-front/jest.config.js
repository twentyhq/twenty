export default {
  setupFilesAfterEnv: ["./src/setupTests.ts"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|js|tsx|jsx)$": "@swc/jest",
  },
  moduleNameMapper: {
    '~/(.+)': "<rootDir>/src/$1",
    '@/(.+)': "<rootDir>/src/modules/$1",
    '@testing/(.+)': "<rootDir>/src/testing/$1",
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  coverageThreshold: {
    global: {
      statements: 10,
      lines: 10,
      functions: 7,
    },
  },
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    'states/.+State.ts$',
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

  ],
  // coverageDirectory: '<rootDir>/coverage/',
}