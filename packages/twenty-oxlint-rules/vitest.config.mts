import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: 'packages/twenty-oxlint-rules',
    include: ['rules/**/*.spec.ts'],
    globals: true,
  },
});
