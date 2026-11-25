import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.spec.json'],
    }),
  ],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
