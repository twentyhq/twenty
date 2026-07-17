import { isDefined } from 'twenty-shared/utils';

const FRONT_COMPONENT_SOURCE_CACHE_NAME = 'front-component-source-v1';

export const frontComponentCacheStorageService = {
  computeChecksum: async ({
    source,
  }: {
    source: string;
  }): Promise<string | undefined> => {
    if (typeof crypto === 'undefined' || !isDefined(crypto.subtle)) {
      return undefined;
    }

    try {
      const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(source),
      );

      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      return undefined;
    }
  },

  open: async (): Promise<Cache | undefined> => {
    if (typeof caches === 'undefined') {
      return undefined;
    }

    try {
      return await caches.open(FRONT_COMPONENT_SOURCE_CACHE_NAME);
    } catch {
      return undefined;
    }
  },

  read: async ({
    cache,
    url,
  }: {
    cache: Cache;
    url: string;
  }): Promise<string | undefined> => {
    try {
      const cachedResponse = await cache.match(url);

      return isDefined(cachedResponse)
        ? await cachedResponse.text()
        : undefined;
    } catch {
      return undefined;
    }
  },

  write: ({
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
  },

  delete: ({ cache, url }: { cache: Cache; url: string }): void => {
    cache.delete(url).catch(() => undefined);
  },

  evictStaleEntriesForComponent: ({
    cache,
    url,
  }: {
    cache: Cache;
    url: string;
  }): void => {
    const componentUrlPrefix = url.slice(0, url.lastIndexOf('/') + 1);

    cache
      .keys()
      .then((cachedRequests) => {
        const staleRequests = cachedRequests.filter(
          (cachedRequest) =>
            cachedRequest.url !== url &&
            cachedRequest.url.startsWith(componentUrlPrefix),
        );

        for (const staleRequest of staleRequests) {
          cache.delete(staleRequest).catch(() => undefined);
        }
      })
      .catch(() => undefined);
  },
};
