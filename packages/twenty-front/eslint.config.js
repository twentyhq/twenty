import typescriptParser from '@typescript-eslint/parser';
import path from 'path';
import { fileURLToPath } from 'url';
import reactConfig from '../../eslint.config.react.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Extend shared React configuration
  ...reactConfig,

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/mockServiceWorker.js',
      '**/generated*/**',
      '**/build/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/*config.js',
      'jest.config.ts',
      'lingui.config.ts',
      'vite.config.ts',
      'setupTests.ts',
      '**/__mocks__/**',
      'src/testing/mock-data/**',
    ],
  },

  // TypeScript project-specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: [path.resolve(__dirname, 'tsconfig.dev.json')],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
];
