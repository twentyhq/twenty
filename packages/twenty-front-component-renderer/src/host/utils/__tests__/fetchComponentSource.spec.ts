import { createHash, webcrypto } from 'node:crypto';
import { TextEncoder as NodeTextEncoder } from 'node:util';

import { fetchComponentSource } from '@/host/utils/fetchComponentSource';

const COMPONENT_SOURCE = 'export default () => {};';

const computeSha256Hex = (content: string): string =>
  createHash('sha256').update(content).digest('hex');

const buildFingerprintedUrl = (checksum: string): string =>
  `https://api.twenty.com/rest/front-components/component-id/${checksum}.js`;

const FINGERPRINTED_URL = buildFingerprintedUrl(
  computeSha256Hex(COMPONENT_SOURCE),
);
const BARE_URL = 'https://api.twenty.com/rest/front-components/component-id';
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

  it('does not cache a network response whose checksum does not match the URL', async () => {
    const cache = new FakeCache();

    setupCaches(cache);

    const staleUrl = buildFingerprintedUrl(
      computeSha256Hex('some other build output'),
    );

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: staleUrl });

    expect(source).toBe(COMPONENT_SOURCE);
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

  it('falls back to the network when CacheStorage is unavailable', async () => {
    (globalThis as unknown as { caches?: unknown }).caches = undefined;

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not trust the cache when WebCrypto is unavailable', async () => {
    const cache = new FakeCache();

    await cache.put(FINGERPRINTED_URL, {
      text: async () => COMPONENT_SOURCE,
    });
    cache.put.mockClear();

    setupCaches(cache);

    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
    });

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse(COMPONENT_SOURCE),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe(COMPONENT_SOURCE);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cache.put).not.toHaveBeenCalled();
  });
});
