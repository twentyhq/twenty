import { isDefined } from 'twenty-shared/utils';

const FRONT_COMPONENT_SOURCE_CACHE_NAME = 'front-component-source-v1';

// Built front-component URLs are content-addressed:
// /front-components/:id/:sha256Checksum.js. Only those URLs are cacheable,
// and the checksum doubles as the integrity anchor for cached content.
// Legacy md5 (32-hex) checksums are rejected so their bundles are never
// cached without verification.
const SHA256_FINGERPRINTED_URL_PATTERN = /\/([0-9a-f]{64})\.js$/;

export const extractComponentChecksumFromUrl = ({
  url,
}: {
  url: string;
}): string | undefined => {
  const match = url.match(SHA256_FINGERPRINTED_URL_PATTERN);

  return match?.[1];
};

// CacheStorage is origin-scoped and writable by any same-origin code,
// including the untrusted component code this cache feeds. Cached content
// must therefore never be trusted by location alone: always compare its
// checksum against the one embedded in the component URL, which is provided
// by the trusted host on every mount.
export const computeSourceChecksum = async ({
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
};

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

export const deleteComponentSourceFromCache = ({
  cache,
  url,
}: {
  cache: Cache;
  url: string;
}): void => {
  cache.delete(url).catch(() => undefined);
};
