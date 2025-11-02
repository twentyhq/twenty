import typescriptParser from '@typescript-eslint/parser';
import path from 'path';
import { fileURLToPath } from 'url';
import reactConfig from '../../eslint.config.react.mjs';

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
    '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:sdk',
              onlyDependOnLibsWithTags: ['scope:sdk'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:backend',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:backend'],
            },
            {
              sourceTag: 'scope:frontend',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:frontend'],
            },
            {
              sourceTag: 'scope:zapier',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:browser-extension',
              onlyDependOnLibsWithTags: ['scope:twenty-ui', 'scope:browser-extension']
            }
          ],
        },
    ],
    }
  },

];
