import { type Plugin } from 'esbuild';

const SORTED_GLOB_NAMESPACE = 'sorted-tinyglobby';

export const SORTED_GLOB_PLUGIN: Plugin = {
  name: SORTED_GLOB_NAMESPACE,
  setup(build) {
    build.onResolve({ filter: /^tinyglobby$/ }, (args) =>
      args.namespace === SORTED_GLOB_NAMESPACE
        ? { path: 'tinyglobby', external: true }
        : { path: 'tinyglobby', namespace: SORTED_GLOB_NAMESPACE },
    );
    build.onLoad({ filter: /.*/, namespace: SORTED_GLOB_NAMESPACE }, () => ({
      contents: `const tinyglobby = require('tinyglobby');
module.exports = { ...tinyglobby, glob: async (...args) => (await tinyglobby.glob(...args)).sort() };`,
      loader: 'js',
    }));
  },
};
