import path from 'path';
import { fileURLToPath } from 'url';
import { globalConfig } from '../../eslint.config.global.mjs';
import { reactConfig } from '../../eslint.config.react.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...globalConfig,
  ...reactConfig,
  {
    ignores: [
      'node_modules/**',
      'mockServiceWorker.js',
      '**/generated*/**',
      'build/**',
      'coverage/**',
      'storybook-static/**',
      '**/*config.js',
      'jest.config.ts',
      'lingui.config.ts', 
      'vite.config.ts',
      'setupTests.ts',
      '**/__mocks__/**',
    ],
  },

  // Twenty-front specific TypeScript config
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: [path.resolve(__dirname, 'tsconfig.dev.json')],
      },
    },
  },
];