import path from 'node:path';
import { defineConfig } from 'vitest/config';

import { createBundledSourcePlugin } from './vite.bundled-source-plugin';

export default defineConfig({
  plugins: [createBundledSourcePlugin()],
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  test: {
    name: 'twenty-cli',
    environment: 'node',
    include: ['src/**/__tests__/**/*.spec.ts'],
  },
});
