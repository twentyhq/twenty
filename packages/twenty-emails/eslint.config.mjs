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

  // Twenty-emails specific TypeScript config
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['packages/twenty-emails/tsconfig.*.json'],
      },
    },
    rules: {
      '@nx/dependency-checks': 'error',
    },
  },
];