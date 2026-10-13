import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
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
