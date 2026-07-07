import { type HostFetchFunction } from '@/types/HostFetchFunction';
import { installHostFetchProxy } from '../installHostFetchProxy';

class StubResponse {
  body: string;
  status: number;
  statusText: string;
  headers: Headers;

  constructor(
    body: string,
    init?: {
      status?: number;
      statusText?: string;
      headers?: Record<string, string>;
    },
  ) {
    this.body = body;
    this.status = init?.status ?? 200;
    this.statusText = init?.statusText ?? '';
    this.headers = new Headers(init?.headers);
  }

  get ok() {
    return this.status >= 200 && this.status < 300;
  }

  async text() {
    return this.body;
  }
}

const originalFetch = globalThis.fetch;
const originalResponse = (globalThis as { Response?: unknown }).Response;

const createHostFetchStub = (): HostFetchFunction =>
  jest.fn(async () => ({
    status: 201,
    statusText: 'Created',
    headers: { 'content-type': 'application/json' },
    body: 'proxied',
  }));

describe('installHostFetchProxy', () => {
  beforeAll(() => {
    (globalThis as { Response?: unknown }).Response = StubResponse;
  });

  afterAll(() => {
    (globalThis as { Response?: unknown }).Response = originalResponse;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should route proxied origins through the host fetch bridge', async () => {
    const nativeFetch = jest.fn(async () => new StubResponse('native'));
    globalThis.fetch = nativeFetch as unknown as typeof fetch;

    const hostFetch = createHostFetchStub();

    installHostFetchProxy(hostFetch, ['https://api.twenty.test']);

    await fetch('https://api.twenty.test/graphql', {
      method: 'POST',
      body: '{"query":"{ me }"}',
    });

    expect(hostFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.twenty.test/graphql',
        method: 'POST',
        body: '{"query":"{ me }"}',
      }),
    );
    expect(nativeFetch).not.toHaveBeenCalled();
  });

  it('should pass non-proxied origins through to the native fetch', async () => {
    const nativeFetch = jest.fn(async () => new StubResponse('native'));
    globalThis.fetch = nativeFetch as unknown as typeof fetch;

    const hostFetch = createHostFetchStub();

    installHostFetchProxy(hostFetch, ['https://api.twenty.test']);

    const response = await fetch('https://cdn.public.test/chart.js');

    expect(nativeFetch).toHaveBeenCalled();
    expect(hostFetch).not.toHaveBeenCalled();
    expect(await response.text()).toBe('native');
  });

  it('should default the content type when serializing URLSearchParams bodies', async () => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;

    const hostFetch = createHostFetchStub();

    installHostFetchProxy(hostFetch, ['https://api.twenty.test']);

    await fetch('https://api.twenty.test/track', {
      method: 'POST',
      body: new URLSearchParams({ event: 'clicked' }),
    });

    expect(hostFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'event=clicked',
        headers: expect.objectContaining({
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        }),
      }),
    );
  });

  it('should rebuild a Response from the host fetch result', async () => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;

    const hostFetch = createHostFetchStub();

    installHostFetchProxy(hostFetch, ['https://api.twenty.test']);

    const response = await fetch('https://api.twenty.test/graphql', {
      method: 'POST',
      body: '{}',
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(201);
    expect(response.statusText).toBe('Created');
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(await response.text()).toBe('proxied');
  });
});
