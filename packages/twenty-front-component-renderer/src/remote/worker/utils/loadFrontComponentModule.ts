import { isDefined } from 'twenty-shared/utils';

import { createJavaScriptModuleBlobUrl } from '@/remote/worker/utils/createJavaScriptModuleBlobUrl';
import { createSdkClientModuleBlobUrls } from '@/remote/worker/utils/createSdkClientModuleBlobUrls';
import { revokeSdkClientModuleBlobUrls } from '@/remote/worker/utils/revokeSdkClientModuleBlobUrls';
import { rewriteModuleImportsToBlobUrls } from '@/remote/worker/utils/rewriteModuleImportsToBlobUrls';
import { type SdkClientSources } from '@/types/SdkClientSources';
import { containsVendorImportSpecifier } from '@/utils/containsVendorImportSpecifier';
import { VENDOR_BUNDLE_IMPORT_SPECIFIER } from 'twenty-shared/application';

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
    throw new Error(
      'The front component imports its vendor bundle, but no vendor bundle was provided',
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
    {
      ...(isDefined(sdkModuleBlobUrls)
        ? {
            'twenty-client-sdk/core': sdkModuleBlobUrls.core,
            'twenty-client-sdk/metadata': sdkModuleBlobUrls.metadata,
          }
        : {}),
      ...(isDefined(vendorModuleBlobUrl)
        ? { [VENDOR_BUNDLE_IMPORT_SPECIFIER]: vendorModuleBlobUrl }
        : {}),
    },
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
