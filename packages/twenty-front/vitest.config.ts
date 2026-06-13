import { argosVitestPlugin } from '@argos-ci/storybook/vitest-plugin';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const MINUTES_IN_MS = 60 * 1000;

const shouldCaptureArgosScreenshots = ['modules', 'pages'].includes(
  process.env.STORYBOOK_SCOPE ?? '',
);

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
        extends: './vite.config.ts',
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            ...(process.env.STORYBOOK_URL
              ? { storybookUrl: process.env.STORYBOOK_URL }
              : { storybookScript: 'yarn storybook --no-open' }),
          }),
          ...(shouldCaptureArgosScreenshots
            ? [
                argosVitestPlugin({
                  uploadToArgos: !!process.env.ARGOS_TOKEN,
                  token: process.env.ARGOS_TOKEN,
                  apiBaseUrl: process.env.ARGOS_API_BASE_URL,
                  buildName: process.env.ARGOS_BUILD_NAME || undefined,
                  branch: process.env.ARGOS_BRANCH || undefined,
                  commit: process.env.ARGOS_COMMIT || undefined,
                  referenceCommit:
                    process.env.ARGOS_REFERENCE_COMMIT || undefined,
                }),
              ]
            : []),
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
          // Browser-mode interaction tests are inherently flaky under heavy
          // shards (transient image loads, animation/timing). Retry transient
          // failures rather than failing the whole shard on one flaky story.
          retry: 2,
          // Story play functions run as a hook; under vite 8 the modules shard
          // is heavier, so the default 30s hook timeout trips multi-step
          // interactions (e.g. the Dropdown open/close cycles) on slower CI
          // runners. Match testTimeout so play functions get the same budget.
          hookTimeout: 5 * MINUTES_IN_MS,
        },
      },
    ],
  },
});
