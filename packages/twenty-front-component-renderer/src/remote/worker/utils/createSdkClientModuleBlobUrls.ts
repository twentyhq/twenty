import { createJavaScriptModuleBlobUrl } from '@/remote/worker/utils/createJavaScriptModuleBlobUrl';
import { type SdkClientSources } from '@/types/SdkClientSources';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

export const createSdkClientModuleBlobUrls = (
  sdkClientSources: SdkClientSources,
): SdkClientUrls => ({
  core: createJavaScriptModuleBlobUrl(sdkClientSources.core),
  metadata: createJavaScriptModuleBlobUrl(sdkClientSources.metadata),
});
