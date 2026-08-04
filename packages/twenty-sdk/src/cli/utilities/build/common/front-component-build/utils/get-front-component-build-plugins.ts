import type * as esbuild from 'esbuild';

import { createVendorShimPlugin } from '@/cli/utilities/build/common/vendor-build/create-vendor-shim-plugin';
import { type VendorBuildContext } from '@/cli/utilities/build/common/vendor-build/types/vendor-build-context.type';
import { cssInjectionPlugin } from '../css-injection-plugin';
import { createJsxRuntimeRemoteWrapperPlugin } from '../jsx-runtime-remote-wrapper-plugin';
import { jsxTransformToRemoteDomWorkerFormatPlugin } from '../jsx-transform-to-remote-dom-worker-format-plugin';
import { createPreactAliasPlugin } from '../preact-alias-plugin';
import { stripCommentsPlugin } from '../strip-comments-plugin';

type GetFrontComponentBuildPluginsOptions = {
  usePreact?: boolean;
  getVendorBuildContext?: () => VendorBuildContext | null;
};

// The vendor shim plugin resolves vendored specifiers before the jsx wrapper
// gets a chance to intercept them, so a vendored react is served by the vendor
// bundle instead of being wrapped and bundled again into every component.
export const getFrontComponentBuildPlugins = (
  options?: GetFrontComponentBuildPluginsOptions,
): esbuild.Plugin[] => [
  ...(options?.getVendorBuildContext
    ? [createVendorShimPlugin(options.getVendorBuildContext)]
    : []),
  createJsxRuntimeRemoteWrapperPlugin(
    options?.usePreact ? { usePreact: true } : undefined,
  ),
  ...(options?.usePreact ? [createPreactAliasPlugin()] : []),
  jsxTransformToRemoteDomWorkerFormatPlugin,
  cssInjectionPlugin,
  stripCommentsPlugin,
];
