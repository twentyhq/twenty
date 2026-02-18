import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupFetchInterceptor } from '../setupFetchInterceptor';

describe('setupFetchInterceptor', () => {
  const originalFetch = globalThis.fetch;
  const originalProcess = (globalThis as Record<string, unknown>)['process'];

  beforeEach(() => {
    const processPrototype =
      typeof originalProcess === 'object' && originalProcess !== null
        ? originalProcess
        : {};
    const processObjectWithPrototype = Object.create(
      processPrototype,
    ) as Record<string, unknown>;

    processObjectWithPrototype['env'] = {};

    (globalThis as Record<string, unknown>)['process'] =
      processObjectWithPrototype;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalProcess) {
      (globalThis as Record<string, unknown>)['process'] = originalProcess;
      return;
    }

    delete (globalThis as Record<string, unknown>)['process'];
  });

  it('should refresh and retry once for trusted 401 responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    const requestRefresh = vi.fn().mockResolvedValue('new-token');

    globalThis.fetch = fetchMock as typeof fetch;

    setupFetchInterceptor({
      requestRefresh,
      trustedBaseUrl: 'https://api.example.com',
    });

    const response = await globalThis.fetch('https://api.example.com/resource');

    expect(response.status).toBe(200);
    expect(requestRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const retryHeaders = new Headers(fetchMock.mock.calls[1][1]?.headers);

    expect(retryHeaders.get('Authorization')).toBe('Bearer new-token');

    const processObject = (globalThis as Record<string, unknown>)[
      'process'
    ] as Record<string, unknown>;
    const processEnvironment = processObject['env'] as Record<string, string>;

    expect(processEnvironment['TWENTY_APP_ACCESS_TOKEN']).toBe('new-token');
  });

  it('should refresh and retry once for trusted GraphQL UNAUTHENTICATED responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            errors: [{ extensions: { code: 'UNAUTHENTICATED' } }],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { ok: true } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    const requestRefresh = vi.fn().mockResolvedValue('new-token');

    globalThis.fetch = fetchMock as typeof fetch;

    setupFetchInterceptor({
      requestRefresh,
      trustedBaseUrl: 'https://api.example.com',
    });

    const response = await globalThis.fetch('https://api.example.com/graphql');

    expect(response.status).toBe(200);
    expect(requestRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const retryHeaders = new Headers(fetchMock.mock.calls[1][1]?.headers);

    expect(retryHeaders.get('Authorization')).toBe('Bearer new-token');
  });

  it('should ignore 401 responses for external URLs', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }));
    const requestRefresh = vi.fn().mockResolvedValue('new-token');

    globalThis.fetch = fetchMock as typeof fetch;

    setupFetchInterceptor({
      requestRefresh,
      trustedBaseUrl: 'https://api.example.com',
    });

    const response = await globalThis.fetch(
      'https://evil.example.com/resource',
    );

    expect(response.status).toBe(401);
    expect(requestRefresh).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should return retry 401 response without loops', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(
        new Response('still unauthorized', { status: 401 }),
      );
    const requestRefresh = vi.fn().mockResolvedValue('new-token');

    globalThis.fetch = fetchMock as typeof fetch;

    setupFetchInterceptor({
      requestRefresh,
      trustedBaseUrl: 'https://api.example.com',
    });

    const response = await globalThis.fetch('https://api.example.com/resource');

    expect(response.status).toBe(401);
    expect(requestRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should deduplicate concurrent refresh requests', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValue(new Response('ok', { status: 200 }));
    let resolveRefreshPromise: ((value: string) => void) | undefined;
    const requestRefresh = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveRefreshPromise = resolve;
        }),
    );

    globalThis.fetch = fetchMock as typeof fetch;

    setupFetchInterceptor({
      requestRefresh,
      trustedBaseUrl: 'https://api.example.com',
    });

    const firstRequest = globalThis.fetch('https://api.example.com/resource-1');
    const secondRequest = globalThis.fetch(
      'https://api.example.com/resource-2',
    );

    await Promise.resolve();

    expect(requestRefresh).toHaveBeenCalledTimes(1);

    resolveRefreshPromise?.('new-token');

    const [firstResponse, secondResponse] = await Promise.all([
      firstRequest,
      secondRequest,
    ]);

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('should preserve original Request headers when retrying', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    const requestRefresh = vi.fn().mockResolvedValue('new-token');

    globalThis.fetch = fetchMock as typeof fetch;

    setupFetchInterceptor({
      requestRefresh,
      trustedBaseUrl: 'https://api.example.com',
    });

    const request = new Request('https://api.example.com/resource', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom': 'custom-value',
      },
      body: JSON.stringify({ hello: 'world' }),
    });

    await globalThis.fetch(request);

    const retryRequest = fetchMock.mock.calls[1][0];

    expect(retryRequest).toBeInstanceOf(Request);

    const retryRequestHeaders = (retryRequest as Request).headers;

    expect(retryRequestHeaders.get('Content-Type')).toBe('application/json');
    expect(retryRequestHeaders.get('X-Custom')).toBe('custom-value');
    expect(retryRequestHeaders.get('Authorization')).toBe('Bearer new-token');
  });

  it('should return original 401 when refresh rejects', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }));
    const requestRefresh = vi
      .fn()
      .mockRejectedValue(new Error('No refresh token available'));

    globalThis.fetch = fetchMock as typeof fetch;

    setupFetchInterceptor({
      requestRefresh,
      trustedBaseUrl: 'https://api.example.com',
    });

    const response = await globalThis.fetch('https://api.example.com/resource');

    expect(response.status).toBe(401);
    expect(requestRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should not trust lookalike hostnames', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }));
    const requestRefresh = vi.fn().mockResolvedValue('new-token');

    globalThis.fetch = fetchMock as typeof fetch;

    setupFetchInterceptor({
      requestRefresh,
      trustedBaseUrl: 'https://api.example.com',
    });

    await globalThis.fetch('https://api.example.com.evil/resource');

    expect(requestRefresh).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
