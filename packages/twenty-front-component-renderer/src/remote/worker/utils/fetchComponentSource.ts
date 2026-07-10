import { isDefined } from 'twenty-shared/utils';

import { extractComponentChecksumFromUrl } from '@/remote/worker/utils/extractComponentChecksumFromUrl';
import { fetchComponentSourceFromNetwork } from '@/remote/worker/utils/fetchComponentSourceFromNetwork';
import { frontComponentCacheStorageService } from '@/remote/worker/utils/frontComponentCacheStorageService';

export const fetchComponentSource = async ({
  url,
  headers,
}: {
  url: string;
  headers?: Record<string, string>;
}): Promise<string> => {
  const expectedChecksum = extractComponentChecksumFromUrl({ url });

  const cache = isDefined(expectedChecksum)
    ? await frontComponentCacheStorageService.open()
    : undefined;

  if (isDefined(cache) && isDefined(expectedChecksum)) {
    const cachedSource = await frontComponentCacheStorageService.read({
      cache,
      url,
    });

    if (isDefined(cachedSource)) {
      const cachedSourceChecksum =
        await frontComponentCacheStorageService.computeChecksum({
          source: cachedSource,
        });

      if (cachedSourceChecksum === expectedChecksum) {
        return cachedSource;
      }

      // Poisoned or corrupt entry: any same-origin code can write to
      // CacheStorage, so a mismatch means the content cannot be trusted.
      frontComponentCacheStorageService.delete({ cache, url });
    }
  }

  const source = await fetchComponentSourceFromNetwork({ url, headers });

  if (isDefined(cache) && isDefined(expectedChecksum)) {
    const sourceChecksum =
      await frontComponentCacheStorageService.computeChecksum({ source });

    if (sourceChecksum === expectedChecksum) {
      frontComponentCacheStorageService.write({ cache, url, source });
    }
  }

  return source;
};
