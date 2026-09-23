import { isDefined } from 'twenty-shared/utils';

import { assertComponentSourceMatchesChecksum } from '@/host/component-source/utils/assertComponentSourceMatchesChecksum';
import { computeComponentSourceChecksum } from '@/host/component-source/utils/computeComponentSourceChecksum';
import { deleteComponentSourceFromCache } from '@/host/component-source/utils/deleteComponentSourceFromCache';
import { evictStaleComponentSourceCacheEntries } from '@/host/component-source/utils/evictStaleComponentSourceCacheEntries';
import { extractComponentChecksumFromUrl } from '@/host/component-source/utils/extractComponentChecksumFromUrl';
import { fetchComponentSourceFromNetwork } from '@/host/component-source/utils/fetchComponentSourceFromNetwork';
import { openComponentSourceCache } from '@/host/component-source/utils/openComponentSourceCache';
import { readComponentSourceFromCache } from '@/host/component-source/utils/readComponentSourceFromCache';
import { writeComponentSourceToCache } from '@/host/component-source/utils/writeComponentSourceToCache';

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
      const cachedSourceChecksum = await computeComponentSourceChecksum({
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

  if (!isDefined(expectedChecksum)) {
    return source;
  }

  await assertComponentSourceMatchesChecksum({ url, source, expectedChecksum });

  if (isDefined(cache)) {
    writeComponentSourceToCache({ cache, url, source });
    evictStaleComponentSourceCacheEntries({ cache, url });
  }

  return source;
};
