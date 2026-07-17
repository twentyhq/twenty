import { fetchComponentSource } from '@/host/utils/fetchComponentSource';
import { type SdkClientSources } from '@/types/SdkClientSources';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

// The fingerprinted `.js` suffix on content-addressed SDK urls makes host-side
// verification, caching and prefix eviction work through the same path as the
// component source. Bare urls (SDK not yet generated) fall back to a plain
// network fetch with no caching.
export const fetchSdkClientSources = async ({
  sdkClientUrls,
  headers,
}: {
  sdkClientUrls: SdkClientUrls;
  headers?: Record<string, string>;
}): Promise<SdkClientSources> => {
  const [core, metadata] = await Promise.all([
    fetchComponentSource({ url: sdkClientUrls.core, headers }),
    fetchComponentSource({ url: sdkClientUrls.metadata, headers }),
  ]);

  return { core, metadata };
};
