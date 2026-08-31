import { afterEach, describe, expect, it, vi } from 'vitest';

import { firefliesApiRequest } from 'src/logic-functions/utils/fireflies-api-request';

describe('firefliesApiRequest', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each([
    { errorCode: 'request_timeout', expectedStatus: 408 },
    { errorCode: 'too_many_requests', expectedStatus: 429 },
    { errorCode: 'invariant_violation', expectedStatus: 500 },
  ])(
    'maps Fireflies $errorCode errors returned over HTTP 200 to status $expectedStatus',
    async ({ errorCode, expectedStatus }) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(
          async () =>
            new Response(
              JSON.stringify({
                errors: [
                  {
                    message: 'Fireflies request failed',
                    extensions: { code: errorCode },
                  },
                ],
              }),
              { status: 200 },
            ),
        ),
      );

      const result = await firefliesApiRequest({
        accessToken: 'access-token',
        query: 'query Test { user { user_id } }',
      });

      expect(result).toEqual(
        expect.objectContaining({
          ok: false,
          status: expectedStatus,
        }),
      );
    },
  );

  it('retries a transient server error and returns the eventual success', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('server error', { status: 500 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { user: { user_id: '1' } } }), {
          status: 200,
        }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const result = await firefliesApiRequest({
      accessToken: 'access-token',
      query: 'query Test { user { user_id } }',
    });

    expect(result).toEqual(expect.objectContaining({ ok: true }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('gives up after the bounded attempts on a persistent server error', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(
        async () => new Response('server error', { status: 500 }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const result = await firefliesApiRequest({
      accessToken: 'access-token',
      query: 'query Test { user { user_id } }',
    });

    expect(result).toEqual(expect.objectContaining({ ok: false, status: 500 }));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('bounds a stalled request with the per-request timeout and does not retry it', async () => {
    const timeoutError = Object.assign(
      new Error('The operation was aborted due to timeout'),
      { name: 'TimeoutError' },
    );
    const fetchMock = vi.fn().mockRejectedValue(timeoutError);

    vi.stubGlobal('fetch', fetchMock);

    const result = await firefliesApiRequest({
      accessToken: 'access-token',
      query: 'query Test { user { user_id } }',
    });

    expect(result).toEqual({
      ok: false,
      status: 0,
      errorMessage: 'Fireflies API request timed out after 10000ms',
      isTimeout: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('retries rate limiting using the shared retry policy', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('rate limited', { status: 429 }));

    vi.stubGlobal('fetch', fetchMock);

    const resultPromise = firefliesApiRequest({
      accessToken: 'access-token',
      query: 'query Test { user { user_id } }',
    });

    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toEqual(expect.objectContaining({ ok: false, status: 429 }));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
