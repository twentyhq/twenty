import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      plugins: [['@lingui/swc-plugin', {}]],
    }),
    tsconfigPaths({
      root: __dirname,
      projects: ['tsconfig.json'],
    }),
  ],
  resolve: {
    alias: {
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  test: {
    name: 'twenty-front',
    environment: 'jsdom',
    globals: true,
    reporters: ['verbose'],
    watch: false,
    pool: 'forks',
    isolate: false,
    setupFiles: ['./setupTests.vitest.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.storybook/**'],
    alias: {
      // Mock static assets for tests (like Jest's moduleNameMapper)
      '\\.(jpg|jpeg|png|gif|webp|svg)$': path.resolve(
        __dirname,
        './__mocks__/imageMockFront.js',
      ),
    },
    deps: {
      optimizer: {
        web: {
          include: ['twenty-ui', 'twenty-shared'],
        },
      },
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text-summary'],
      reportsDirectory: './coverage',
    },
    // Performance optimizations
    maxConcurrency: 10,
    fileParallelism: true,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
