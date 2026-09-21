import { fetchJavaScriptModuleSourceText } from '@/host/component-source/utils/fetchJavaScriptModuleSourceText';
import { type SdkClientSources } from '@/types/SdkClientSources';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

export const fetchSdkClientSources = async ({
  sdkClientUrls,
  headers,
}: {
  sdkClientUrls: SdkClientUrls;
  headers?: Record<string, string>;
}): Promise<SdkClientSources> => {
  const [core, metadata] = await Promise.all([
    fetchJavaScriptModuleSourceText(sdkClientUrls.core, headers),
    fetchJavaScriptModuleSourceText(sdkClientUrls.metadata, headers),
  ]);

  return { core, metadata };
};
