import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { graphFetch, graphFetchJson } from 'src/logic-functions/utils/graph-fetch.util';
import { GraphRequestError } from 'src/logic-functions/utils/graph-request-error';

const buildResponse = (
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

describe('graphFetch', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('prefixes relative urls with the Graph v1.0 base and sends the bearer token', async () => {
    fetchMock.mockResolvedValueOnce(buildResponse(200, { value: [] }));

    const result = await graphFetchJson<{ value: unknown[] }>({
      accessToken: 'token',
      url: 'users/u1/onlineMeetings',
    });

    expect(result).toEqual({ value: [] });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://graph.microsoft.com/v1.0/users/u1/onlineMeetings',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      }),
    );
  });

  it('retries a throttled request after the Retry-After delay', async () => {
    fetchMock
      .mockResolvedValueOnce(buildResponse(429, {}, { 'Retry-After': '2' }))
      .mockResolvedValueOnce(buildResponse(200, { ok: true }));

    const pendingFetch = graphFetch({
      accessToken: 'token',
      url: 'https://graph.microsoft.com/v1.0/me',
    });

    await vi.advanceTimersByTimeAsync(2_000);

    expect((await pendingFetch).ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces the Graph inner error code without retrying', async () => {
    fetchMock.mockResolvedValueOnce(
      buildResponse(403, {
        error: {
          code: 'Forbidden',
          message: 'Transcript access is disabled',
          innerError: { code: 'GraphAccessToTranscriptsDisabled' },
        },
      }),
    );

    const error = await graphFetch({
      accessToken: 'token',
      url: 'me',
    }).catch((caughtError: unknown) => caughtError);

    expect(error).toBeInstanceOf(GraphRequestError);
    expect((error as GraphRequestError).status).toBe(403);
    expect((error as GraphRequestError).innerErrorCode).toBe(
      'GraphAccessToTranscriptsDisabled',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
