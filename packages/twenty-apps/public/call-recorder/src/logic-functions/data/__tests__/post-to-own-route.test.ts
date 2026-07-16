import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { postToOwnRoute } from 'src/logic-functions/data/post-to-own-route.util';

const fetchMock = vi.fn();

describe('postToOwnRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TWENTY_FUNCTIONS_URL', 'https://acme.functions.example.com');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-access-token');
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('posts to the functions origin when resolved', async () => {
    const result = await postToOwnRoute({
      path: '/call-recorder/some-route',
      body: { key: 'value' },
    });

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toBe(
      'https://acme.functions.example.com/call-recorder/some-route',
    );
    expect(requestInit.method).toBe('POST');
    expect(requestInit.body).toBe(JSON.stringify({ key: 'value' }));
    expect(requestInit.signal).toBeInstanceOf(AbortSignal);
  });

  it('treats timeout as a successfully flushed request', async () => {
    const timeoutError = new Error('Timed out');
    timeoutError.name = 'TimeoutError';
    fetchMock.mockRejectedValue(timeoutError);

    await expect(
      postToOwnRoute({ path: '/call-recorder/some-route', body: {} }),
    ).resolves.toBe(true);
  });

  it('returns false when the request fails before flushing', async () => {
    fetchMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      postToOwnRoute({ path: '/call-recorder/some-route', body: {} }),
    ).resolves.toBe(false);
  });

  it('returns false when the route base url cannot be resolved', async () => {
    vi.stubEnv('TWENTY_FUNCTIONS_URL', '');

    await expect(
      postToOwnRoute({ path: '/call-recorder/some-route', body: {} }),
    ).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
