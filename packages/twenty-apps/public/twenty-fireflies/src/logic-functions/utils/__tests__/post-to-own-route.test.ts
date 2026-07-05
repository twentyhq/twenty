import { beforeEach, describe, expect, it, vi } from 'vitest';

import { postToOwnRoute } from 'src/logic-functions/utils/post-to-own-route';

const postMock = vi.hoisted(() => vi.fn());
const restApiClientMock = vi.hoisted(() => vi.fn());
const fetchFunctionsBaseUrlMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: restApiClientMock,
}));

vi.mock('src/logic-functions/utils/fetch-functions-base-url', () => ({
  fetchFunctionsBaseUrl: fetchFunctionsBaseUrlMock,
}));

describe('postToOwnRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    restApiClientMock.mockImplementation(function RestApiClient() {
      return { post: postMock };
    });
    postMock.mockResolvedValue({});
    fetchFunctionsBaseUrlMock.mockResolvedValue(undefined);
  });

  it('posts to the functions origin without the legacy prefix when resolved', async () => {
    fetchFunctionsBaseUrlMock.mockResolvedValue(
      'https://acme.functions.example.com',
    );

    const result = await postToOwnRoute({
      path: '/fireflies/backfill',
      body: { fromDate: '2026-04-06T00:00:00.000Z' },
    });

    expect(result).toBe(true);
    expect(restApiClientMock).toHaveBeenCalledWith({
      baseUrl: 'https://acme.functions.example.com',
    });
    expect(postMock).toHaveBeenCalledWith(
      '/fireflies/backfill',
      { fromDate: '2026-04-06T00:00:00.000Z' },
      { signal: expect.any(AbortSignal) },
    );
  });

  it('falls back to the legacy /s route when no functions origin exists', async () => {
    const result = await postToOwnRoute({
      path: '/fireflies/backfill',
      body: {},
    });

    expect(result).toBe(true);
    expect(restApiClientMock).toHaveBeenCalledWith();
    expect(postMock).toHaveBeenCalledWith(
      '/s/fireflies/backfill',
      {},
      { signal: expect.any(AbortSignal) },
    );
  });

  it('treats timeout as a successfully flushed request', async () => {
    const timeoutError = new Error('Timed out');
    timeoutError.name = 'TimeoutError';
    postMock.mockRejectedValue(timeoutError);

    await expect(
      postToOwnRoute({ path: '/fireflies/backfill', body: {} }),
    ).resolves.toBe(true);
  });

  it('returns false when the request fails before flushing', async () => {
    postMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      postToOwnRoute({ path: '/fireflies/backfill', body: {} }),
    ).resolves.toBe(false);
  });
});
