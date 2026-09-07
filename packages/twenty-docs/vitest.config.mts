import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: 'packages/twenty-docs',
    include: ['scripts/**/*.spec.ts'],
    globals: true,
  },
});
