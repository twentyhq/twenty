import baseConfig from './vite.config';
import { defineConfig, mergeConfig } from 'vitest/config';

export default defineConfig((configEnv) =>
  mergeConfig(baseConfig(configEnv), {
    test: {
      name: 'twenty-front',
      environment: 'jsdom',
      globals: true,
      reporters: ['verbose'],
      watch: false,
      pool: 'threads',
      setupFiles: ['./setupTests.vitest.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx,js,jsx}'],
      deps: {
        inline: ['twenty-ui', 'twenty-shared'],
      },
      coverage: {
        enabled: true,
        provider: 'v8',
        reporter: ['text-summary'],
        reportsDirectory: './coverage',
      },
    },
  }),
);
