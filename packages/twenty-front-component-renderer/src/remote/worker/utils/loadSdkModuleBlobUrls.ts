import { createJavaScriptModuleBlobUrl } from '@/remote/worker/utils/createJavaScriptModuleBlobUrl';
import { fetchModuleSourceText } from '@/remote/worker/utils/fetchModuleSourceText';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

export const loadSdkModuleBlobUrls = async (
  sdkClientUrls: SdkClientUrls,
  headers?: Record<string, string>,
): Promise<SdkClientUrls> => {
  const [core, metadata] = await Promise.all([
    fetchModuleSourceText(sdkClientUrls.core, headers).then(
      createJavaScriptModuleBlobUrl,
    ),
    fetchModuleSourceText(sdkClientUrls.metadata, headers).then(
      createJavaScriptModuleBlobUrl,
    ),
  ]);

  return { core, metadata };
};
