import { type SharedDependenciesBuildContext } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/types/shared-dependencies-build-context.type';
import { getSharedDependenciesShimSource } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/utils/get-shared-dependencies-shim-source';
import type * as esbuild from 'esbuild';
import { isDefined } from 'twenty-shared/utils';

const SHARED_DEPENDENCIES_SHIM_NAMESPACE = 'twenty-shared-dependencies-shim';

export const createSharedDependenciesShimPlugin = (
  getSharedDependenciesBuildContext: () => SharedDependenciesBuildContext | null,
): esbuild.Plugin => ({
  name: 'twenty-shared-dependencies-shim',
  setup: (build) => {
    build.onResolve({ filter: /.*/ }, ({ path: specifier }) => {
      const sharedDependenciesBuildContext =
        getSharedDependenciesBuildContext();

      if (!isDefined(sharedDependenciesBuildContext)) {
        return undefined;
      }

      if (
        !sharedDependenciesBuildContext.exportNamesBySpecifier.has(specifier)
      ) {
        return undefined;
      }

      return { path: specifier, namespace: SHARED_DEPENDENCIES_SHIM_NAMESPACE };
    });

    build.onLoad(
      { filter: /.*/, namespace: SHARED_DEPENDENCIES_SHIM_NAMESPACE },
      ({ path: specifier }) => {
        const exportNames =
          getSharedDependenciesBuildContext()?.exportNamesBySpecifier.get(
            specifier,
          );

        if (!isDefined(exportNames)) {
          return undefined;
        }

        return {
          contents: getSharedDependenciesShimSource({ specifier, exportNames }),
          loader: 'js' as const,
        };
      },
    );
  },
});
