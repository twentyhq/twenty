import path from 'node:path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const TWENTY_SDK_SRC = path.resolve(__dirname, '../../../twenty-sdk/src/sdk');
const TWENTY_SDK_ROOT = path.resolve(__dirname, '../../../twenty-sdk/src');

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.spec.json'],
      ignoreConfigErrors: true,
    }),
  ],
  resolve: {
    alias: [
      {
        find: 'twenty-sdk/define',
        replacement: path.join(TWENTY_SDK_SRC, 'define/index.ts'),
      },
      {
        find: 'twenty-sdk/logic-function',
        replacement: path.join(TWENTY_SDK_SRC, 'logic-function/index.ts'),
      },
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(TWENTY_SDK_ROOT, '$1'),
      },
    ],
  },
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
  },
});
