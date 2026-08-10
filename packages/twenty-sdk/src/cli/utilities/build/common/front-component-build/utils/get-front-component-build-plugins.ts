import type * as esbuild from 'esbuild';
import { isDefined } from 'twenty-shared/utils';

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

export const getFrontComponentBuildPlugins = (
  options?: GetFrontComponentBuildPluginsOptions,
): esbuild.Plugin[] => [
  ...(isDefined(options?.getVendorBuildContext)
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
