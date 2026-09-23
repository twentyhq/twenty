import { createHash, webcrypto } from 'node:crypto';
import { TextEncoder as NodeTextEncoder } from 'node:util';

import { CustomError } from 'twenty-shared/utils';

import { fetchComponentSource } from '@/host/component-source/utils/fetchComponentSource';

const COMPONENT_SOURCE = 'export default () => {};';

const CHECKSUM_MISMATCH_CODE = 'FRONT_COMPONENT_SOURCE_CHECKSUM_MISMATCH';

const computeSha256Hex = (content: string): string =>
  createHash('sha256').update(content).digest('hex');

const buildFingerprintedUrl = (checksum: string): string =>
  `https://api.twenty.com/rest/front-components/component-id/${checksum}.js`;

const FINGERPRINTED_URL = buildFingerprintedUrl(
  computeSha256Hex(COMPONENT_SOURCE),
);
const STALE_URL = buildFingerprintedUrl(
  computeSha256Hex('some other build output'),
);
const BARE_URL = 'https://api.twenty.com/rest/front-components/component-id';
const PRESIGNED_URL =
  'https://bucket.example.com/built.mjs?X-Amz-Signature=SECRET_SIGNATURE';

const SHARED_DEPENDENCIES_SOURCE =
  'export const __shared_dependencies_react__ = {};';

const buildFingerprintedSharedDependenciesUrl = (checksum: string): string =>
  `https://api.twenty.com/rest/front-component-shared-dependencies/application-id/${checksum}.js`;

const FINGERPRINTED_SHARED_DEPENDENCIES_URL =
  buildFingerprintedSharedDependenciesUrl(
    computeSha256Hex(SHARED_DEPENDENCIES_SOURCE),
  );
const LEGACY_MD5_URL = buildFingerprintedUrl(
  createHash('md5').update(COMPONENT_SOURCE).digest('hex'),
);

const createFakeJsResponse = (body: string) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: {
    get: (name: string) =>
      name === 'content-type' ? 'application/javascript' : null,
  },
  text: jest.fn(async () => body),
  json: jest.fn(async () => undefined),
});

const createFakeJsonHandoffResponse = (presignedUrl: string) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: {
    get: (name: string) =>
      name === 'content-type' ? 'application/json' : null,
  },
  text: jest.fn(async () => ''),
  json: jest.fn(async () => ({ url: presignedUrl })),
});

class FakeCache {
  private readonly store = new Map<string, string>();

  match = jest.fn(async (key: string) => {
    const cached = this.store.get(key);

    return isDefinedString(cached) ? { text: async () => cached } : undefined;
  });

  put = jest.fn(
    async (key: string, response: { text: () => Promise<string> }) => {
      this.store.set(key, await response.text());
    },
  );

  delete = jest.fn(async (key: string | { url: string }) =>
    this.store.delete(typeof key === 'string' ? key : key.url),
  );

  keys = jest.fn(async () =>
    Array.from(this.store.keys()).map((key) => ({ url: key })),
  );
}

const isDefinedString = (value: string | undefined): value is string =>
  value !== undefined;

const setupCaches = (cache: FakeCache) => {
  (globalThis as unknown as { caches: unknown }).caches = {
    open: jest.fn(async () => cache),
  };
};

const disableWebCrypto = () => {
  Object.defineProperty(globalThis, 'crypto', {
    value: undefined,
    configurable: true,
  });
};

const captureRejection = async (promise: Promise<unknown>): Promise<unknown> =>
  promise.then(
    () => undefined,
    (thrown: unknown) => thrown,
  );

describe('fetchComponentSource', () => {
  const originalFetch = globalThis.fetch;
  const originalCaches = (globalThis as unknown as { caches?: unknown }).caches;
  const originalResponse = (globalThis as unknown as { Response?: unknown })
    .Response;
  const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  const originalTextEncoder = (
    globalThis as unknown as { TextEncoder?: unknown }
  ).TextEncoder;

  beforeEach(() => {
    (globalThis as unknown as { Response: unknown }).Response = class {
      body: string;
      constructor(body: string) {
        this.body = body;
      }
      async text() {
        return this.body;
      }
    };

    Object.defineProperty(globalThis, 'crypto', {
      value: webcrypto,
      configurable: true,
    });
    (globalThis as unknown as { TextEncoder: unknown }).TextEncoder =
      NodeTextEncoder;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    (globalThis as unknown as { caches?: unknown }).caches = originalCaches;
    (globalThis as unknown as { Response?: unknown }).Response =
      originalResponse;

    if (originalCrypto !== undefined) {
      Object.defineProperty(globalThis, 'crypto', originalCrypto);
    }

    (globalThis as unknown as { TextEncoder?: unknown }).TextEncoder =
      originalTextEncoder;
    jest.clearAllMocks();
  });

  it('fetches from the network and caches the result on a miss', async () => {
    const cache = new FakeCache();

    setupCaches(cache);

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(cache.put).toHaveBeenCalledTimes(1);
    expect(cache.put.mock.calls[0][0]).toBe(FINGERPRINTED_URL);
  });

  it('evicts stale entries of the same component when caching a new build', async () => {
    const cache = new FakeCache();

    const staleUrl = buildFingerprintedUrl(
      computeSha256Hex('previous build output'),
    );
    const otherComponentUrl =
      'https://api.twenty.com/rest/front-components/other-component-id/0000000000000000000000000000000000000000000000000000000000000000.js';

    await cache.put(staleUrl, {
      text: async () => 'previous build output',
    });
    await cache.put(otherComponentUrl, {
      text: async () => 'other component source',
    });
    cache.put.mockClear();

    setupCaches(cache);

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    // Eviction is fire-and-forget; flush pending promise callbacks
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(source).toBe(COMPONENT_SOURCE);
    expect(cache.delete).toHaveBeenCalledWith({ url: staleUrl });
    expect(cache.delete).not.toHaveBeenCalledWith({ url: otherComponentUrl });
    expect(cache.delete).not.toHaveBeenCalledWith({ url: FINGERPRINTED_URL });
  });

  it('serves a verified cache hit without hitting the network', async () => {
    const cache = new FakeCache();

    await cache.put(FINGERPRINTED_URL, {
      text: async () => COMPONENT_SOURCE,
    });

    setupCaches(cache);

    const fetchMock = jest.fn();

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('evicts a poisoned cache entry and refetches from the network', async () => {
    const cache = new FakeCache();

    await cache.put(FINGERPRINTED_URL, {
      text: async () => 'globalThis.injectedByAnotherComponent = true;',
    });

    setupCaches(cache);

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(cache.delete).toHaveBeenCalledWith(FINGERPRINTED_URL);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to the network when the cached response body is unreadable', async () => {
    const cache = new FakeCache();

    setupCaches(cache);

    cache.match.mockResolvedValueOnce({
      text: async () => {
        throw new Error('body unreadable');
      },
    });

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects a network response whose checksum does not match the URL and does not cache it', async () => {
    const cache = new FakeCache();

    setupCaches(cache);

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      fetchComponentSource({ url: STALE_URL }),
    ).rejects.toMatchObject({ code: CHECKSUM_MISMATCH_CODE });
    expect(cache.put).not.toHaveBeenCalled();
    expect(cache.delete).not.toHaveBeenCalled();
  });

  it('evicts a poisoned cache entry and rejects when the network response also mismatches', async () => {
    const cache = new FakeCache();

    await cache.put(FINGERPRINTED_URL, {
      text: async () => 'globalThis.injectedByAnotherComponent = true;',
    });
    cache.put.mockClear();

    setupCaches(cache);

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse('some other build output'),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      fetchComponentSource({ url: FINGERPRINTED_URL }),
    ).rejects.toMatchObject({ code: CHECKSUM_MISMATCH_CODE });
    expect(cache.delete).toHaveBeenCalledWith(FINGERPRINTED_URL);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cache.put).not.toHaveBeenCalled();
  });

  it('evicts the previous shared dependencies bundle of the same application only', async () => {
    const cache = new FakeCache();

    const staleSharedDependenciesUrl = buildFingerprintedSharedDependenciesUrl(
      computeSha256Hex('previous shared dependencies build'),
    );
    const otherApplicationSharedDependenciesUrl =
      'https://api.twenty.com/rest/front-component-shared-dependencies/other-application-id/0000000000000000000000000000000000000000000000000000000000000000.js';

    await cache.put(staleSharedDependenciesUrl, {
      text: async () => 'previous shared dependencies build',
    });
    await cache.put(otherApplicationSharedDependenciesUrl, {
      text: async () => 'other application shared dependencies',
    });
    cache.put.mockClear();

    setupCaches(cache);

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(SHARED_DEPENDENCIES_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await fetchComponentSource({ url: FINGERPRINTED_SHARED_DEPENDENCIES_URL });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(cache.delete).toHaveBeenCalledWith({
      url: staleSharedDependenciesUrl,
    });
    expect(cache.delete).not.toHaveBeenCalledWith({
      url: otherApplicationSharedDependenciesUrl,
    });
  });

  it('rejects a mismatched shared dependencies bundle and does not cache it', async () => {
    const cache = new FakeCache();

    setupCaches(cache);

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(
        'export const __shared_dependencies_react__ = { tampered: true };',
      ),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      fetchComponentSource({ url: FINGERPRINTED_SHARED_DEPENDENCIES_URL }),
    ).rejects.toMatchObject({ code: CHECKSUM_MISMATCH_CODE });
    expect(cache.put).not.toHaveBeenCalled();
  });

  it('returns and caches a matching presigned handoff response', async () => {
    const cache = new FakeCache();

    setupCaches(cache);

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(createFakeJsonHandoffResponse(PRESIGNED_URL))
      .mockResolvedValueOnce(createFakeJsResponse(COMPONENT_SOURCE));

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(cache.put).toHaveBeenCalledTimes(1);
    expect(cache.put.mock.calls[0][0]).toBe(FINGERPRINTED_URL);
  });

  it('does not leak the presigned URL, headers, or source in the checksum mismatch error', async () => {
    const cache = new FakeCache();

    setupCaches(cache);

    const substitutedSource = 'globalThis.leak = "SOURCE_MARKER";';

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(createFakeJsonHandoffResponse(PRESIGNED_URL))
      .mockResolvedValueOnce(createFakeJsResponse(substitutedSource));

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const error = await captureRejection(
      fetchComponentSource({
        url: FINGERPRINTED_URL,
        headers: { Authorization: 'Bearer SECRET_TOKEN' },
      }),
    );

    expect(error).toBeInstanceOf(CustomError);

    const { message, code } = error as CustomError;

    expect(code).toBe(CHECKSUM_MISMATCH_CODE);
    expect(message).toContain(FINGERPRINTED_URL);
    expect(message).toContain(computeSha256Hex(COMPONENT_SOURCE));
    expect(message).toContain(computeSha256Hex(substitutedSource));

    for (const secret of [
      'SECRET_TOKEN',
      'SECRET_SIGNATURE',
      'bucket.example.com',
      'SOURCE_MARKER',
    ]) {
      expect(message).not.toContain(secret);
      expect(String(error)).not.toContain(secret);
    }

    expect(cache.put).not.toHaveBeenCalled();
  });

  it('never touches the cache for a non-fingerprinted URL', async () => {
    const cache = new FakeCache();

    setupCaches(cache);

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse('bare url source'),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: BARE_URL });

    expect(source).toBe('bare url source');
    expect(cache.match).not.toHaveBeenCalled();
    expect(cache.put).not.toHaveBeenCalled();
  });

  it('never touches the cache for a legacy md5-fingerprinted URL', async () => {
    const cache = new FakeCache();

    setupCaches(cache);

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: LEGACY_MD5_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(cache.match).not.toHaveBeenCalled();
    expect(cache.put).not.toHaveBeenCalled();
  });

  it('returns a verified network response when CacheStorage is unavailable', async () => {
    (globalThis as unknown as { caches?: unknown }).caches = undefined;

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects a mismatched network response even when CacheStorage is unavailable', async () => {
    (globalThis as unknown as { caches?: unknown }).caches = undefined;

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      fetchComponentSource({ url: STALE_URL }),
    ).rejects.toMatchObject({ code: CHECKSUM_MISMATCH_CODE });
  });

  it('verifies a cache hit with the pure-JS digest when WebCrypto is unavailable', async () => {
    const cache = new FakeCache();

    await cache.put(FINGERPRINTED_URL, {
      text: async () => COMPONENT_SOURCE,
    });
    cache.put.mockClear();

    setupCaches(cache);
    disableWebCrypto();

    const fetchMock = jest.fn();

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(cache.delete).not.toHaveBeenCalled();
  });

  it('caches a matching network response with the pure-JS digest when WebCrypto is unavailable', async () => {
    const cache = new FakeCache();

    setupCaches(cache);
    disableWebCrypto();

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(cache.put).toHaveBeenCalledTimes(1);
    expect(cache.put.mock.calls[0][0]).toBe(FINGERPRINTED_URL);
  });

  it('rejects a mismatched network response with the pure-JS digest when WebCrypto is unavailable', async () => {
    const cache = new FakeCache();

    setupCaches(cache);
    disableWebCrypto();

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      fetchComponentSource({ url: STALE_URL }),
    ).rejects.toMatchObject({ code: CHECKSUM_MISMATCH_CODE });
    expect(cache.put).not.toHaveBeenCalled();
  });

  it('falls back to the pure-JS digest when crypto.subtle.digest throws', async () => {
    const cache = new FakeCache();

    setupCaches(cache);

    Object.defineProperty(globalThis, 'crypto', {
      value: {
        subtle: {
          digest: () => {
            throw new Error('opaque origin');
          },
        },
      },
      configurable: true,
    });

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(cache.put).toHaveBeenCalledTimes(1);
  });
});
