import { createJavaScriptModuleBlobUrl } from '@/remote/worker/utils/createJavaScriptModuleBlobUrl';
import { fetchModuleSourceText } from '@/remote/worker/utils/fetchModuleSourceText';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

export const loadSdkModuleBlobUrls = async (
  sdkClientUrls: SdkClientUrls,
  headers?: Record<string, string>,
): Promise<SdkClientUrls> => {
  const [coreResult, metadataResult] = await Promise.allSettled([
    fetchModuleSourceText(sdkClientUrls.core, headers).then(
      createJavaScriptModuleBlobUrl,
    ),
    fetchModuleSourceText(sdkClientUrls.metadata, headers).then(
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
