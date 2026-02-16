import type * as esbuild from 'esbuild';

export const createPreactAliasPlugin = (): esbuild.Plugin => ({
  name: 'preact-alias',
  setup: (build) => {
    let preactCompatClientPath: string | undefined;

    build.onResolve({ filter: /^react-dom\/client$/ }, async (args) => {
      if (!preactCompatClientPath) {
        const resolved = await build.resolve('preact/compat/client', {
          kind: args.kind,
          resolveDir: args.resolveDir,
        });

        preactCompatClientPath = resolved.path;
      }

      return { path: preactCompatClientPath };
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
