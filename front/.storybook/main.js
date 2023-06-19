const path = require('path');

module.exports = {
  webpackFinal: config => {
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [{
        loader: require.resolve('babel-loader'),
        options: {
          presets: [require('@babel/preset-typescript').default, [require('@babel/preset-react').default, {
            runtime: 'automatic'
          }], require('@babel/preset-env').default]
        }
      }]
    });
    config.resolve.extensions.push('.ts', '.tsx');
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto'
    });
    config.resolve.extensions.push('.mjs');
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(__dirname, "../src"),
      '@': path.resolve(__dirname, "../src/modules"),
    };
    return config;
  },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-create-react-app",
    "@storybook/addon-coverage",
    "@storybook/addon-styling"

  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
};