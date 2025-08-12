import typescriptParser from '@typescript-eslint/parser';
import path from 'path';
import { fileURLToPath } from 'url';
import reactConfig from '../../eslint.config.react.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = [
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
      '**/__mocks__/**',
      'src/testing/mock-data/**',
    ],
  },

  // CommonJS files configuration
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'writable',
        global: 'readonly',
        Buffer: 'readonly',
      },
      sourceType: 'commonjs',
    },
  },

  // TypeScript project-specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: [
          path.resolve(__dirname, 'tsconfig.dev.json'),
          path.resolve(__dirname, 'tsconfig.storybook.json'),
          path.resolve(__dirname, 'tsconfig.spec.json'),
        ],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
];

// Add CI-specific rules if in CI environment
// eslint-disable-next-line no-undef
if (process.env.NX_TASK_TARGET_CONFIGURATION === 'ci') {
  config.push({
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-console': 'error',
    },
  });
}

export default config;
