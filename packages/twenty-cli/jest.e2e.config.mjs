const jestConfig = {
  displayName: 'twenty-cli-e2e',
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
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.e2e-spec.{js,ts}',
    '<rootDir>/src/**/?(*.)e2e-spec.{js,ts}',
  ],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/e2e/setup.ts'],
  globalTeardown: '<rootDir>/src/__tests__/e2e/teardown.ts',
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true,
};

export default jestConfig;