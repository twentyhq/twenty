const jestConfig = {
  displayName: 'fireflies',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(test|spec).{js,ts}',
    '<rootDir>/src/**/?(*.)(test|spec).{js,ts}',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: './coverage',
};

export default jestConfig;