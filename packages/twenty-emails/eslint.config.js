import path from 'path';
import { fileURLToPath } from 'url';
import typescriptParser from '@typescript-eslint/parser';
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
    ],
  },

  // TypeScript project-specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: [path.resolve(__dirname, 'tsconfig.*.json')],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Nx dependency checks
      '@nx/dependency-checks': 'error',
    },
  },
];
