/* eslint-disable @nx/enforce-module-boundaries,import/no-relative-packages */
import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions as twentyUiCompilerOptions } from '../twenty-ui/tsconfig.json';

import { compilerOptions } from './tsconfig.json';

const jestConfig: JestConfigWithTsJest = {
  // to enable logs, comment out the following line
  silent: true,
  displayName: 'twenty-front',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['./setupTests.ts'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['../../node_modules/'],
  transform: {
    '^.+\\.(ts|js|tsx|jsx)$': '@swc/jest',
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths),
    // Include internal library aliases, so there is no need to build the library before tests.
    ...pathsToModuleNameMapper(twentyUiCompilerOptions.paths),
    '\\.(jpg|jpeg|png|gif|webp|svg|svg\\?react)$':
      '<rootDir>/__mocks__/imageMock.js',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
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
  coverageDirectory: './coverage',
};

export default jestConfig;
