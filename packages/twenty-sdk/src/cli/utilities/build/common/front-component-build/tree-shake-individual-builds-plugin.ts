import * as path from 'path';
import type * as esbuild from 'esbuild';

// Marks resolved files from individual builds as side-effect-free so esbuild
// can tree-shake unused re-exports from barrel files. Without this, esbuild
// conservatively includes all imports from a barrel because it cannot determine
// that the imported modules are free of side effects.
export const createTreeShakeIndividualBuildsPlugin = (
  individualBuildPaths: string[],
): esbuild.Plugin => ({
  name: 'tree-shake-individual-builds',
  setup(build) {
    const isIndividualBuildFile = (filePath: string): boolean =>
      individualBuildPaths.some(
        (buildPath) =>
          filePath.startsWith(buildPath + '/') || filePath === buildPath,
      );

    build.onResolve({ filter: /.*/ }, async (args) => {
      if (args.namespace === 'tree-shake-no-side-effects') {
        return undefined;
      }

      if (args.kind !== 'import-statement') {
        return undefined;
      }

      const resolvedDir = args.resolveDir;

      if (!resolvedDir || !isIndividualBuildFile(resolvedDir)) {
        return undefined;
      }

      const result = await build.resolve(args.path, {
        resolveDir: args.resolveDir,
        kind: args.kind,
        namespace: 'tree-shake-no-side-effects',
        pluginData: { skipTreeShake: true },
      });

      if (result.errors.length > 0) {
        return undefined;
      }

      return {
        path: result.path,
        sideEffects: false,
      };
    });
  },
});
