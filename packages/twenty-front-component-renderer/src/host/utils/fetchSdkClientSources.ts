import { fetchJavaScriptModuleSourceText } from '@/host/utils/fetchJavaScriptModuleSourceText';
import { type SdkClientSources } from '@/types/SdkClientSources';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

// SDK client modules are served directly (no presigned-URL hop) from
// content-addressed, immutable URLs, so a plain HTTP-cached fetch is enough:
// the browser HTTP cache serves repeat loads and self-invalidates on any
// checksum change. Bare fallback URLs (SDK not yet generated) are served
// no-store and simply refetched each time.
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
