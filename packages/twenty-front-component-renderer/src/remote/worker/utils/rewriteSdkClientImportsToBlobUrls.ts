import { rewriteModuleImportsToBlobUrls } from '@/remote/worker/utils/rewriteModuleImportsToBlobUrls';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

export const rewriteSdkClientImportsToBlobUrls = (
  source: string,
  sdkModuleBlobUrls: SdkClientUrls,
): string =>
  rewriteModuleImportsToBlobUrls(source, {
    'twenty-client-sdk/core': sdkModuleBlobUrls.core,
    'twenty-client-sdk/metadata': sdkModuleBlobUrls.metadata,
  });
