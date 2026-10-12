import type * as esbuild from 'esbuild';

export const createPreactAliasPlugin = (): esbuild.Plugin => ({
  name: 'preact-alias',
  setup: (build) => {
    build.onResolve({ filter: /^react-dom\/client$/ }, async (args) => {
      return build.resolve('preact/compat/client', {
        kind: args.kind,
        resolveDir: args.resolveDir,
      });
    });

    build.onResolve({ filter: /^react-dom$/ }, async (args) => {
      const resolved = await build.resolve('preact/compat', {
        kind: args.kind,
        resolveDir: args.resolveDir,
      });

      return { path: resolved.path };
    });
  },
});
