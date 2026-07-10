import { type SdkClientUrls } from '@/types/SdkClientUrls';

export const revokeSdkClientModuleBlobUrls = (
  sdkModuleBlobUrls: SdkClientUrls,
): void => {
  URL.revokeObjectURL(sdkModuleBlobUrls.core);
  URL.revokeObjectURL(sdkModuleBlobUrls.metadata);
};
