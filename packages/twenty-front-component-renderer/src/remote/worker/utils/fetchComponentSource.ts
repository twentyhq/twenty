import { z } from 'zod';

import { isDefined } from 'twenty-shared/utils';

const FRONT_COMPONENT_SOURCE_CACHE_NAME = 'front-component-source-v1';

const componentSourceHandoffSchema = z.object({ url: z.url() });

const isFingerprintedComponentUrl = (url: string): boolean =>
  url.endsWith('.js');

const openComponentSourceCache = async (): Promise<Cache | undefined> => {
  if (typeof caches === 'undefined') {
    return undefined;
  }

  try {
    return await caches.open(FRONT_COMPONENT_SOURCE_CACHE_NAME);
  } catch {
    return undefined;
  }
};

const readComponentSourceFromCache = async (
  cache: Cache,
  url: string,
): Promise<string | undefined> => {
  try {
    const cachedResponse = await cache.match(url);

    return isDefined(cachedResponse) ? cachedResponse.text() : undefined;
  } catch {
    return undefined;
  }
};

const fetchComponentSourceFromNetwork = async (
  url: string,
  headers?: Record<string, string>,
): Promise<string> => {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const handoff = componentSourceHandoffSchema.safeParse(
      await response.json(),
    );

    if (!handoff.success) {
      throw new Error(`Invalid component source handoff response from ${url}`);
    }

    const presignedResponse = await fetch(handoff.data.url);

    if (!presignedResponse.ok) {
      throw new Error(
        `Failed to fetch presigned URL: ${presignedResponse.status} ${presignedResponse.statusText}`,
      );
    }

    return presignedResponse.text();
  }

  return response.text();
};

export const fetchComponentSource = async (
  url: string,
  headers?: Record<string, string>,
): Promise<string> => {
  const cache = isFingerprintedComponentUrl(url)
    ? await openComponentSourceCache()
    : undefined;

  if (isDefined(cache)) {
    const cachedSource = await readComponentSourceFromCache(cache, url);

    if (isDefined(cachedSource)) {
      return cachedSource;
    }
  }

  const source = await fetchComponentSourceFromNetwork(url, headers);

  if (isDefined(cache)) {
    cache
      .put(
        url,
        new Response(source, {
          headers: { 'Content-Type': 'application/javascript' },
        }),
      )
      .catch(() => undefined);
  }

  return source;
};
