import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const MINUTES_IN_MS = 60 * 1000;

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['json', 'text'],
      reportsDirectory: './coverage/storybook',
    },
    projects: [
      {
        extends: './vite.config.browser.ts',
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            storybookScript: 'yarn storybook --no-open --port 6008',
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
          testTimeout: 5 * MINUTES_IN_MS,
          retry: 2,
        },
      },
    ],
  },
});
