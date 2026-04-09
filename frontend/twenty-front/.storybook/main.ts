import type { StorybookConfig } from '@storybook/react-vite';

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

  build: {
    test: {
      disabledAddons: [
        '@storybook/addon-docs',
        '@storybook/addon-essentials/docs',
      ],
    },
  },

  addons: [
    // '@chromatic-com/storybook',
    '@storybook-community/storybook-addon-cookie',
    '@storybook/addon-links',
    '@storybook/addon-coverage',
    'storybook-addon-pseudo-states',
    // 'storybook-dark-mode',
    'storybook-addon-mock-date',
    '@storybook/addon-vitest',
  ],

  framework: '@storybook/react-vite',

  viteFinal: async (viteConfig) => {
    const { mergeConfig } = await import('vite');

    return mergeConfig(viteConfig, {
      logLevel: 'warn',
    });
  },

  logLevel: 'error',

  docs: {},
};

export default config;
