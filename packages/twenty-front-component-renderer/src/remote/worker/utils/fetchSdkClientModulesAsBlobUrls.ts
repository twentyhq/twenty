import { createJavaScriptModuleBlobUrl } from '@/remote/worker/utils/createJavaScriptModuleBlobUrl';
import { fetchJavaScriptModuleSourceText } from '@/remote/worker/utils/fetchJavaScriptModuleSourceText';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

export const fetchSdkClientModulesAsBlobUrls = async (
  sdkClientUrls: SdkClientUrls,
  headers?: Record<string, string>,
): Promise<SdkClientUrls> => {
  const [coreResult, metadataResult] = await Promise.allSettled([
    fetchJavaScriptModuleSourceText(sdkClientUrls.core, headers).then(
      createJavaScriptModuleBlobUrl,
    ),
    fetchJavaScriptModuleSourceText(sdkClientUrls.metadata, headers).then(
      createJavaScriptModuleBlobUrl,
    ),
  ]);

  if (
    coreResult.status === 'rejected' ||
    metadataResult.status === 'rejected'
  ) {
    for (const result of [coreResult, metadataResult]) {
      if (result.status === 'fulfilled') {
        URL.revokeObjectURL(result.value);
      }
    }

    throw coreResult.status === 'rejected'
      ? coreResult.reason
      : (metadataResult as PromiseRejectedResult).reason;
  }

  return { core: coreResult.value, metadata: metadataResult.value };
};
