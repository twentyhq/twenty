import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],

  addons: ['@storybook/addon-vitest'],

  framework: '@storybook/react-vite',

  staticDirs: [
    {
      from: '../src/front-component-renderer/__stories__/example-sources-built',
      to: '/built',
    },
  ],

  viteFinal: async (viteConfig) => {
    return {
      ...viteConfig,
      resolve: {
        ...viteConfig.resolve,
        alias: {
          ...viteConfig.resolve?.alias,
          '@': path.resolve(dirname, '../src'),
        },
      },
      worker: {
        format: 'iife',
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          },
        },
        plugins: () => [
          {
            name: 'define-process-env',
            transform: (code: string) =>
              code
                .replace(
                  /process\.env\.NODE_ENV/g,
                  JSON.stringify('production'),
                )
                .replace(/process\.env/g, '{}'),
          },
        ],
      },
      optimizeDeps: {
        ...viteConfig.optimizeDeps,
        include: [
          ...(viteConfig.optimizeDeps?.include ?? []),
          'transliteration',
          '@remote-dom/core/polyfill',
          '@remote-dom/react/polyfill',
          '@remote-dom/core/elements',
          '@remote-dom/react',
          '@remote-dom/react/host',
          'react-dom/client',
          'react/jsx-runtime',
        ],
      },
    };
  },
};

export default config;
