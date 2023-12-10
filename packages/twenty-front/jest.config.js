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
  // collectCoverage: true,
  // collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  // coveragePathIgnorePatterns: ['(tests/.*.mock).(jsx?|tsx?)$', '(.*).d.ts$'],
  // coverageDirectory: '<rootDir>/coverage/',
}