import path from 'path';
import { fileURLToPath } from 'url';
import { globalConfig } from '../../eslint.config.global.mjs';
import { reactConfig } from '../../eslint.config.react.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Global ignores - must be absolute first entry
  {
    ignores: [
      '**/node_modules/**',
      'build/**',
      'coverage/**', 
      'storybook-static/**',
      '.storybook/**',
      'mockServiceWorker.js',
      '**/generated*/**',
      '**/*config.js',
      'jest.config.ts',
      'lingui.config.ts', 
      'vite.config.ts',
      'setupTests.ts',
      '**/__mocks__/**',
    ],
  },

  // Apply global and react configs only to non-ignored files
  ...globalConfig.map(config => ({
    ...config,
    files: config.files || ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      'build/**',
      'storybook-static/**',
      '.storybook/**',
      '**/generated*/**',
      '**/__mocks__/**',
    ],
    rules: {
      ...config.rules,
      // Disable problematic rule globally
      '@nx/workspace-explicit-boolean-predicates-in-if': 'off',
    },
  })),
  
  ...reactConfig.map(config => ({
    ...config,
    files: config.files || ['**/*.{jsx,tsx}'],
    ignores: [
      'build/**',
      'storybook-static/**',
      '.storybook/**',
      '**/generated*/**',
      '**/__mocks__/**',
    ],
    rules: {
      ...config.rules,
      // Disable problematic rule globally
      '@nx/workspace-explicit-boolean-predicates-in-if': 'off',
    },
  })),

  // Disable TypeScript-dependent rules for .d.ts files
  {
    files: ['**/*.d.ts'],
    rules: {
      '@nx/workspace-explicit-boolean-predicates-in-if': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },

  // Twenty-front specific TypeScript config - only for non-declaration src files
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/*.d.ts'],
    languageOptions: {
      parserOptions: {
        project: [path.resolve(__dirname, 'tsconfig.dev.json')],
      },
    },
    rules: {
      // Disable problematic custom rule that causes issues with TypeScript parsing
      '@nx/workspace-explicit-boolean-predicates-in-if': 'off',
    },
  },
];