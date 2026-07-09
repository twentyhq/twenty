import { isDefined } from 'twenty-shared/utils';

import {
  computeSourceChecksum,
  deleteComponentSourceFromCache,
  extractComponentChecksumFromUrl,
  openComponentSourceCache,
  readComponentSourceFromCache,
  writeComponentSourceToCache,
} from '@/remote/worker/utils/componentSourceCache';
import { fetchComponentSourceFromNetwork } from '@/remote/worker/utils/fetchComponentSourceFromNetwork';

export const fetchComponentSource = async ({
  url,
  headers,
}: {
  url: string;
  headers?: Record<string, string>;
}): Promise<string> => {
  const expectedChecksum = extractComponentChecksumFromUrl({ url });

  const cache = isDefined(expectedChecksum)
    ? await openComponentSourceCache()
    : undefined;

  if (isDefined(cache) && isDefined(expectedChecksum)) {
    const cachedSource = await readComponentSourceFromCache({ cache, url });

    if (isDefined(cachedSource)) {
      const cachedSourceChecksum = await computeSourceChecksum({
        source: cachedSource,
      });

      if (cachedSourceChecksum === expectedChecksum) {
        return cachedSource;
      }

      // Poisoned or corrupt entry: any same-origin code can write to
      // CacheStorage, so a mismatch means the content cannot be trusted.
      deleteComponentSourceFromCache({ cache, url });
    }
  }

  const source = await fetchComponentSourceFromNetwork({ url, headers });

  if (isDefined(cache) && isDefined(expectedChecksum)) {
    const sourceChecksum = await computeSourceChecksum({ source });

    // Only verified content is cached; the source itself is still returned
    // as-is since it comes straight from the trusted server.
    if (sourceChecksum === expectedChecksum) {
      writeComponentSourceToCache({ cache, url, source });
    }
  }

  return source;
};
