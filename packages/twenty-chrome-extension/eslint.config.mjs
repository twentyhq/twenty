import path from 'path';
import { fileURLToPath } from 'url';
import { globalConfig } from '../../eslint.config.global.mjs';
import { reactConfig } from '../../eslint.config.react.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Extend global config
  ...globalConfig,
  
  // Extend react config
  ...reactConfig,

  // Ignore patterns specific to twenty-chrome-extension
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '**/generated/**',
    ],
  },

  // Twenty-chrome-extension specific TypeScript config
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['packages/twenty-chrome-extension/tsconfig.*.json'],
      },
    },
    rules: {
      '@nx/workspace-explicit-boolean-predicates-in-if': 'warn',
    },
  },
];