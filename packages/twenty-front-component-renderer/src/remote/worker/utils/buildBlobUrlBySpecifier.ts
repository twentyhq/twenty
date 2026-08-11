import { type SdkClientUrls } from '@/types/SdkClientUrls';
import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const buildBlobUrlBySpecifier = ({
  sdkModuleBlobUrls,
  sharedDependenciesModuleBlobUrl,
}: {
  sdkModuleBlobUrls: SdkClientUrls | null;
  sharedDependenciesModuleBlobUrl: string | null;
}): Record<string, string> => ({
  ...(isDefined(sdkModuleBlobUrls)
    ? {
        'twenty-client-sdk/core': sdkModuleBlobUrls.core,
        'twenty-client-sdk/metadata': sdkModuleBlobUrls.metadata,
      }
    : {}),
  ...(isDefined(sharedDependenciesModuleBlobUrl)
    ? {
        [FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER]:
          sharedDependenciesModuleBlobUrl,
      }
    : {}),
});
