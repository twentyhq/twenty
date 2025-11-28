const jestConfig = {
  displayName: 'twenty-cli',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transformIgnorePatterns: ['../../node_modules/'],
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: false },
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'js'],
  extensionsToTreatAsEsm: ['.ts'],
  coverageDirectory: './coverage',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(test|spec).{js,ts}',
    '<rootDir>/src/**/?(*.)(test|spec).{js,ts}',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/cli.ts', // Exclude CLI entry point from coverage
  ],
  coverageThreshold: {
    global: {
      statements: 1,
      lines: 1,
      functions: 1,
    },
  },
};

export default jestConfig;
