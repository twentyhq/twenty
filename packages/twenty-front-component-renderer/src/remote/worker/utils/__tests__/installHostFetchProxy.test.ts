import { type HostFetchFunction } from '@/types/HostFetch';
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

    const hostFetch: HostFetchFunction = jest.fn(async () => ({
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: 'proxied',
    }));

    installHostFetchProxy(hostFetch, ['https://api.twenty.test']);

    const response = await fetch('https://api.twenty.test/graphql', {
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
    expect(response.ok).toBe(true);
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(await response.text()).toBe('proxied');
  });

  it('should pass non-proxied origins through to the native fetch', async () => {
    const nativeFetch = jest.fn(async () => new StubResponse('native'));
    globalThis.fetch = nativeFetch as unknown as typeof fetch;

    const hostFetch: HostFetchFunction = jest.fn(async () => ({
      status: 200,
      statusText: 'OK',
      headers: {},
      body: 'proxied',
    }));

    installHostFetchProxy(hostFetch, ['https://api.twenty.test']);

    const response = await fetch('https://cdn.public.test/chart.js');

    expect(nativeFetch).toHaveBeenCalled();
    expect(hostFetch).not.toHaveBeenCalled();
    expect(await response.text()).toBe('native');
  });

  it('should forward headers and body from Request object inputs', async () => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;

    const hostFetch: HostFetchFunction = jest.fn(async () => ({
      status: 200,
      statusText: 'OK',
      headers: {},
      body: 'proxied',
    }));

    installHostFetchProxy(hostFetch, ['https://api.twenty.test']);

    const request = {
      url: 'https://api.twenty.test/graphql',
      method: 'POST',
      headers: new Headers({
        authorization: 'Bearer token',
        'content-type': 'application/json',
      }),
      clone: () => ({ text: async () => '{"query":"{ me }"}' }),
    } as unknown as Request;

    await fetch(request);

    expect(hostFetch).toHaveBeenCalledWith({
      url: 'https://api.twenty.test/graphql',
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        'content-type': 'application/json',
      },
      body: '{"query":"{ me }"}',
    });
  });

  it('should reject Request object inputs with non-text bodies', async () => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;

    const hostFetch: HostFetchFunction = jest.fn(async () => ({
      status: 200,
      statusText: 'OK',
      headers: {},
      body: 'proxied',
    }));

    installHostFetchProxy(hostFetch, ['https://api.twenty.test']);

    const request = {
      url: 'https://api.twenty.test/upload',
      method: 'POST',
      headers: new Headers({
        'content-type': 'multipart/form-data; boundary=boundary',
      }),
      clone: () => ({
        text: async () => '--boundary\r\nbinary-payload\r\n--boundary--',
      }),
    } as unknown as Request;

    await expect(fetch(request)).rejects.toThrow(
      'front component fetch bridge',
    );
    expect(hostFetch).not.toHaveBeenCalled();
  });

  it('should serialize URLSearchParams bodies with a form content type', async () => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;

    const hostFetch: HostFetchFunction = jest.fn(async () => ({
      status: 200,
      statusText: 'OK',
      headers: {},
      body: 'proxied',
    }));

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

  it('should reject unsupported body types instead of silently dropping them', async () => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;

    const hostFetch: HostFetchFunction = jest.fn(async () => ({
      status: 200,
      statusText: 'OK',
      headers: {},
      body: 'proxied',
    }));

    installHostFetchProxy(hostFetch, ['https://api.twenty.test']);

    await expect(
      fetch('https://api.twenty.test/upload', {
        method: 'POST',
        body: new FormData(),
      }),
    ).rejects.toThrow('front component fetch bridge');
    expect(hostFetch).not.toHaveBeenCalled();
  });
});
