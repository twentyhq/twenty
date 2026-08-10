import { type SdkClientUrls } from '@/types/SdkClientUrls';
import { VENDOR_BUNDLE_IMPORT_SPECIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const buildBlobUrlBySpecifier = ({
  sdkModuleBlobUrls,
  vendorModuleBlobUrl,
}: {
  sdkModuleBlobUrls: SdkClientUrls | null;
  vendorModuleBlobUrl: string | null;
}): Record<string, string> => ({
  ...(isDefined(sdkModuleBlobUrls)
    ? {
        'twenty-client-sdk/core': sdkModuleBlobUrls.core,
        'twenty-client-sdk/metadata': sdkModuleBlobUrls.metadata,
      }
    : {}),
  ...(isDefined(vendorModuleBlobUrl)
    ? { [VENDOR_BUNDLE_IMPORT_SPECIFIER]: vendorModuleBlobUrl }
    : {}),
});
