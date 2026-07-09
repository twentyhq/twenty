import { isDefined } from 'twenty-shared/utils';

const FRONT_COMPONENT_SOURCE_CACHE_NAME = 'front-component-source-v1';

// Only content-addressed (`.js` checksum) URLs are stable enough to cache;
// bare endpoints resolve to a fresh presigned URL on every call.
export const isFingerprintedComponentUrl = ({
  url,
}: {
  url: string;
}): boolean => url.endsWith('.js');

export const openComponentSourceCache = async (): Promise<
  Cache | undefined
> => {
  if (typeof caches === 'undefined') {
    return undefined;
  }

  try {
    return await caches.open(FRONT_COMPONENT_SOURCE_CACHE_NAME);
  } catch {
    return undefined;
  }
};

export const readComponentSourceFromCache = async ({
  cache,
  url,
}: {
  cache: Cache;
  url: string;
}): Promise<string | undefined> => {
  try {
    const cachedResponse = await cache.match(url);

    return isDefined(cachedResponse) ? cachedResponse.text() : undefined;
  } catch {
    return undefined;
  }
};

export const writeComponentSourceToCache = ({
  cache,
  url,
  source,
}: {
  cache: Cache;
  url: string;
  source: string;
}): void => {
  cache
    .put(
      url,
      new Response(source, {
        headers: { 'Content-Type': 'application/javascript' },
      }),
    )
    .catch(() => undefined);
};
