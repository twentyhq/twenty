import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
      '@create-twenty-app/': `${path.resolve(__dirname, '../create-twenty-app/src')}/`,
    },
  },
  test: {
    name: 'twenty-cli',
    environment: 'node',
    include: ['src/**/__tests__/**/*.spec.ts'],
  },
});
