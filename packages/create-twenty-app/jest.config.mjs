const jestConfig = {
  displayName: 'create-twenty-app',
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
    '^package.json$': '<rootDir>/package.json',
  },
  moduleFileExtensions: ['ts', 'js'],
  extensionsToTreatAsEsm: ['.ts'],
  coverageDirectory: './coverage',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(test|spec).{js,ts}',
    '<rootDir>/src/**/?(*.)(test|spec).{js,ts}',
  ],
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts', '!src/cli.ts'],
};

export default jestConfig;
