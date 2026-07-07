import { beforeEach, describe, expect, it, vi } from 'vitest';

import { postToOwnRoute } from 'src/logic-functions/data/post-to-own-route.util';

const postMock = vi.hoisted(() => vi.fn());
const restApiClientMock = vi.hoisted(() => vi.fn());
const resolveOwnRouteBaseUrlMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: restApiClientMock,
}));

vi.mock('src/logic-functions/data/resolve-own-route-base-url.util', () => ({
  resolveOwnRouteBaseUrl: resolveOwnRouteBaseUrlMock,
}));

describe('postToOwnRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    restApiClientMock.mockImplementation(function RestApiClient() {
      return { post: postMock };
    });
    postMock.mockResolvedValue({});
    resolveOwnRouteBaseUrlMock.mockReturnValue(
      'https://acme.functions.example.com',
    );
  });

  it('posts to the functions origin when resolved', async () => {
    const result = await postToOwnRoute({
      path: '/call-recorder/some-route',
      body: { key: 'value' },
    });

    expect(result).toBe(true);
    expect(restApiClientMock).toHaveBeenCalledWith({
      baseUrl: 'https://acme.functions.example.com',
    });
    expect(postMock).toHaveBeenCalledWith(
      '/call-recorder/some-route',
      { key: 'value' },
      { signal: expect.any(AbortSignal) },
    );
  });

  it('treats timeout as a successfully flushed request', async () => {
    const timeoutError = new Error('Timed out');
    timeoutError.name = 'TimeoutError';
    postMock.mockRejectedValue(timeoutError);

    await expect(
      postToOwnRoute({ path: '/call-recorder/some-route', body: {} }),
    ).resolves.toBe(true);
  });

  it('returns false when the request fails before flushing', async () => {
    postMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      postToOwnRoute({ path: '/call-recorder/some-route', body: {} }),
    ).resolves.toBe(false);
  });

  it('returns false when the route base url cannot be resolved', async () => {
    resolveOwnRouteBaseUrlMock.mockImplementation(() => {
      throw new Error('Unable to resolve target');
    });

    await expect(
      postToOwnRoute({ path: '/call-recorder/some-route', body: {} }),
    ).resolves.toBe(false);
    expect(restApiClientMock).not.toHaveBeenCalled();
    expect(postMock).not.toHaveBeenCalled();
  });
});
