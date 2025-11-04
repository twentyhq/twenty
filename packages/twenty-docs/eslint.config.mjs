import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.mdx'],
    rules: {
      // MDX-specific rules if needed
    },
  },
];

