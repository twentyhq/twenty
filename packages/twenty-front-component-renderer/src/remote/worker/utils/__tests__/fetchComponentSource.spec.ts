import { fetchComponentSource } from '@/remote/worker/utils/fetchComponentSource';

const FINGERPRINTED_URL =
  'https://api.twenty.com/rest/front-components/component-id/checksum-abc.js';
const BARE_URL = 'https://api.twenty.com/rest/front-components/component-id';

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
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    (globalThis as unknown as { caches?: unknown }).caches = originalCaches;
    (globalThis as unknown as { Response?: unknown }).Response =
      originalResponse;
    jest.clearAllMocks();
  });

  it('fetches from the network and caches the result on a miss', async () => {
    const cache = new FakeCache();

    setupCaches(cache);

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse('export default () => {};'),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe('export default () => {};');
    expect(cache.put).toHaveBeenCalledTimes(1);
    expect(cache.put.mock.calls[0][0]).toBe(FINGERPRINTED_URL);
  });

  it('serves a cache hit without hitting the network', async () => {
    const cache = new FakeCache();

    await cache.put(FINGERPRINTED_URL, {
      text: async () => 'cached bundle source',
    });

    setupCaches(cache);

    const fetchMock = jest.fn();

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe('cached bundle source');
    expect(fetchMock).not.toHaveBeenCalled();
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

  it('falls back to the network when CacheStorage is unavailable', async () => {
    (globalThis as unknown as { caches?: unknown }).caches = undefined;

    const fetchMock = jest.fn(async () =>
      createFakeJsResponse('no-cache source'),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const source = await fetchComponentSource({ url: FINGERPRINTED_URL });

    expect(source).toBe('no-cache source');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
