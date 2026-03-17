import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const sdkRoot = path.resolve(dirname, '..');

const config: StorybookConfig = {
  stories: ['../src/front-component-renderer/**/*.stories.@(js|jsx|ts|tsx)'],

  addons: ['@storybook/addon-vitest'],

  framework: '@storybook/react-vite',

  refs: {
    '@chakra-ui/react': { disable: true },
  },

  staticDirs: [
    {
      from: '../src/front-component-renderer/__stories__/example-sources-built',
      to: '/built',
    },
    {
      from: '../src/front-component-renderer/__stories__/example-sources-built-preact',
      to: '/built-preact',
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
          // TODO: Remove these aliases once twenty-ui is migrated to React 19
          // Forces a single React instance to avoid ReactCurrentDispatcher conflicts
          react: path.resolve(dirname, '../node_modules/react'),
          'react-dom': path.resolve(dirname, '../node_modules/react-dom'),
          'react/jsx-runtime': path.resolve(
            dirname,
            '../node_modules/react/jsx-runtime',
          ),
          'react/jsx-dev-runtime': path.resolve(
            dirname,
            '../node_modules/react/jsx-dev-runtime',
          ),
        },
      },
      plugins: [
        ...(viteConfig.plugins ?? []),
        tsconfigPaths({ root: sdkRoot }),
      ],
      optimizeDeps: {
        ...viteConfig.optimizeDeps,
        include: [
          ...(viteConfig.optimizeDeps?.include ?? []),
          'transliteration',
          '@remote-dom/core/polyfill',
          '@remote-dom/react/polyfill',
          '@remote-dom/core/elements',
          '@remote-dom/react',
          'react-dom/client',
          'react/jsx-runtime',
        ],
      },
    };
  },
};

export default config;
