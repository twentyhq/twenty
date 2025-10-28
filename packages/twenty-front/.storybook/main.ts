import { type StorybookConfig } from '@storybook/react-vite';
import { dirname, join } from 'path';

const getAbsolutePath = (value: string): any => {
  return dirname(require.resolve(join(value, 'package.json')));
};

const computeStoriesGlob = () => {
  if (process.env.STORYBOOK_SCOPE === 'pages') {
    return [
      '../src/pages/**/*.stories.@(js|jsx|ts|tsx)',
      '../src/__stories__/*.stories.@(js|jsx|ts|tsx)',
      '../src/pages/**/*.docs.mdx',
      '../src/__stories__/*.docs.mdx',
    ];
  }

  if (process.env.STORYBOOK_SCOPE === 'modules') {
    return [
      '../src/modules/**/!(perf)/*.stories.@(js|jsx|ts|tsx)',
      '../src/modules/**/*.docs.mdx',
    ];
  }

  if (process.env.STORYBOOK_SCOPE === 'performance') {
    return ['../src/modules/**/perf/*.perf.stories.@(js|jsx|ts|tsx)'];
  }

  if (process.env.STORYBOOK_SCOPE === 'ui-docs') {
    return ['../src/modules/ui/**/*.docs.mdx'];
  }

  return ['../src/**/*.docs.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'];
};

const config: StorybookConfig = {
  stories: computeStoriesGlob(),
  staticDirs: ['../public'],

  build: {
    test: {
      disabledAddons: [
        '@storybook/addon-docs',
        '@storybook/addon-essentials/docs',
      ],
    },
  },

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-coverage'),
    // getAbsolutePath("storybook-dark-mode"),
    getAbsolutePath('storybook-addon-cookie'),
    getAbsolutePath('storybook-addon-pseudo-states'),
    getAbsolutePath('storybook-addon-mock-date'),
    // getAbsolutePath("@chromatic-com/storybook")
  ],

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },

  viteFinal: async (config) => {
    // Merge custom configuration into the default config
    const { mergeConfig } = await import('vite');

    return mergeConfig(config, {
      resolve: {
        alias: {
          'react-dom/client': 'react-dom/profiling',
        },
      },
      logLevel: 'warn',
    });
  },

  logLevel: 'error',

  docs: {},
};
export default config;
