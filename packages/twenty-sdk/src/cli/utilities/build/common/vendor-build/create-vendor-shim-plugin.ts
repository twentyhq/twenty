import { type VendorBuildContext } from '@/cli/utilities/build/common/vendor-build/types/vendor-build-context.type';
import { getVendorShimSource } from '@/cli/utilities/build/common/vendor-build/utils/get-vendor-shim-source';
import type * as esbuild from 'esbuild';
import { isDefined } from 'twenty-shared/utils';

const VENDOR_SHIM_NAMESPACE = 'twenty-vendor-shim';

export const createVendorShimPlugin = (
  getVendorBuildContext: () => VendorBuildContext | null,
): esbuild.Plugin => ({
  name: 'twenty-vendor-shim',
  setup: (build) => {
    build.onResolve({ filter: /.*/ }, ({ path: specifier }) => {
      const vendorBuildContext = getVendorBuildContext();

      if (!isDefined(vendorBuildContext)) {
        return undefined;
      }

      if (!vendorBuildContext.exportNamesBySpecifier.has(specifier)) {
        return undefined;
      }

      return { path: specifier, namespace: VENDOR_SHIM_NAMESPACE };
    });

    build.onLoad(
      { filter: /.*/, namespace: VENDOR_SHIM_NAMESPACE },
      ({ path: specifier }) => {
        const exportNames =
          getVendorBuildContext()?.exportNamesBySpecifier.get(specifier);

        if (!isDefined(exportNames)) {
          return undefined;
        }

        return {
          contents: getVendorShimSource({ specifier, exportNames }),
          loader: 'js' as const,
        };
      },
    );
  },
});
