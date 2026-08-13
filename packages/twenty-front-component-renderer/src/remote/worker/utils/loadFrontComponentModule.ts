import { CustomError, isDefined } from 'twenty-shared/utils';

import { buildBlobUrlBySpecifier } from '@/remote/worker/utils/buildBlobUrlBySpecifier';
import { createJavaScriptModuleBlobUrl } from '@/remote/worker/utils/createJavaScriptModuleBlobUrl';
import { createSdkClientModuleBlobUrls } from '@/remote/worker/utils/createSdkClientModuleBlobUrls';
import { revokeSdkClientModuleBlobUrls } from '@/remote/worker/utils/revokeSdkClientModuleBlobUrls';
import { rewriteModuleImportsToBlobUrls } from '@/remote/worker/utils/rewriteModuleImportsToBlobUrls';
import { type SdkClientSources } from '@/types/SdkClientSources';
import { containsSharedDependenciesImportSpecifier } from '@/utils/module-imports/containsSharedDependenciesImportSpecifier';

type LoadFrontComponentModuleInput = {
  componentSource: string;
  sdkClientSources?: SdkClientSources;
  sharedDependenciesSource?: string;
};

type FrontComponentModule = {
  default: (container: Element) => void;
};

export const loadFrontComponentModule = async ({
  componentSource,
  sdkClientSources,
  sharedDependenciesSource,
}: LoadFrontComponentModuleInput): Promise<FrontComponentModule> => {
  const requiresSharedDependencies =
    containsSharedDependenciesImportSpecifier(componentSource);

  if (requiresSharedDependencies && !isDefined(sharedDependenciesSource)) {
    throw new CustomError(
      'The front component imports its shared dependencies bundle, but none was provided',
      'FRONT_COMPONENT_SHARED_DEPENDENCIES_MISSING',
    );
  }

  const sdkModuleBlobUrls = isDefined(sdkClientSources)
    ? createSdkClientModuleBlobUrls(sdkClientSources)
    : null;

  const sharedDependenciesModuleBlobUrl =
    requiresSharedDependencies && isDefined(sharedDependenciesSource)
      ? createJavaScriptModuleBlobUrl(sharedDependenciesSource)
      : null;

  const componentModuleSource = rewriteModuleImportsToBlobUrls(
    componentSource,
    buildBlobUrlBySpecifier({
      sdkModuleBlobUrls,
      sharedDependenciesModuleBlobUrl,
    }),
  );

  const componentModuleBlobUrl = createJavaScriptModuleBlobUrl(
    componentModuleSource,
  );

  try {
    /* @vite-ignore */
    return await import(componentModuleBlobUrl);
  } finally {
    URL.revokeObjectURL(componentModuleBlobUrl);

    if (isDefined(sharedDependenciesModuleBlobUrl)) {
      URL.revokeObjectURL(sharedDependenciesModuleBlobUrl);
    }

    if (isDefined(sdkModuleBlobUrls)) {
      revokeSdkClientModuleBlobUrls(sdkModuleBlobUrls);
    }
  }
};
