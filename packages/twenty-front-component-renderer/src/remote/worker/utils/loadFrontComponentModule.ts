import { CustomError, isDefined } from 'twenty-shared/utils';

import { buildBlobUrlBySpecifier } from '@/remote/worker/utils/buildBlobUrlBySpecifier';
import { createJavaScriptModuleBlobUrl } from '@/remote/worker/utils/createJavaScriptModuleBlobUrl';
import { createSdkClientModuleBlobUrls } from '@/remote/worker/utils/createSdkClientModuleBlobUrls';
import { revokeSdkClientModuleBlobUrls } from '@/remote/worker/utils/revokeSdkClientModuleBlobUrls';
import { rewriteModuleImportsToBlobUrls } from '@/remote/worker/utils/rewriteModuleImportsToBlobUrls';
import { type SdkClientSources } from '@/types/SdkClientSources';
import { containsVendorImportSpecifier } from '@/utils/containsVendorImportSpecifier';

type LoadFrontComponentModuleInput = {
  componentSource: string;
  sdkClientSources?: SdkClientSources;
  vendorSource?: string;
};

type FrontComponentModule = {
  default: (container: Element) => void;
};

export const loadFrontComponentModule = async ({
  componentSource,
  sdkClientSources,
  vendorSource,
}: LoadFrontComponentModuleInput): Promise<FrontComponentModule> => {
  const requiresVendor = containsVendorImportSpecifier(componentSource);

  if (requiresVendor && !isDefined(vendorSource)) {
    throw new CustomError(
      'The front component imports its vendor bundle, but no vendor bundle was provided',
      'FRONT_COMPONENT_VENDOR_BUNDLE_MISSING',
    );
  }

  const sdkModuleBlobUrls = isDefined(sdkClientSources)
    ? createSdkClientModuleBlobUrls(sdkClientSources)
    : null;

  const vendorModuleBlobUrl =
    requiresVendor && isDefined(vendorSource)
      ? createJavaScriptModuleBlobUrl(vendorSource)
      : null;

  const componentModuleSource = rewriteModuleImportsToBlobUrls(
    componentSource,
    buildBlobUrlBySpecifier({ sdkModuleBlobUrls, vendorModuleBlobUrl }),
  );

  const componentModuleBlobUrl = createJavaScriptModuleBlobUrl(
    componentModuleSource,
  );

  try {
    /* @vite-ignore */
    return await import(componentModuleBlobUrl);
  } finally {
    URL.revokeObjectURL(componentModuleBlobUrl);

    if (isDefined(vendorModuleBlobUrl)) {
      URL.revokeObjectURL(vendorModuleBlobUrl);
    }

    if (isDefined(sdkModuleBlobUrls)) {
      revokeSdkClientModuleBlobUrls(sdkModuleBlobUrls);
    }
  }
};
