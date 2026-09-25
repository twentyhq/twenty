import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { pathsToModuleNameMapper } from 'ts-jest';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tsConfigPath = resolve(__dirname, './tsconfig.json');
const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf8'));

const jestConfig = {
  displayName: 'twenty-front-component-renderer',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.mjs'],
  transformIgnorePatterns: [
    'node_modules/(?!(@quilted|boolbase|css-select|css-what|dom-serializer|domelementtype|domhandler|domutils|entities|nth-check)/)',
  ],
  transform: {
    '^.+\\.(mjs|[tj]sx?)$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
    '^@quilted/threads$':
      '<rootDir>/../../node_modules/@quilted/threads/build/esm/index.mjs',
    '^@quilted/events$':
      '<rootDir>/../../node_modules/@quilted/events/build/esm/index.mjs',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  coverageDirectory: './coverage',
};

export default jestConfig;
