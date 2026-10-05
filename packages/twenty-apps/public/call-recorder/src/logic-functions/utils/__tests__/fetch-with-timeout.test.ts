import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchWithTimeout } from 'src/logic-functions/utils/fetch-with-timeout.util';

const stubPendingFetch = () => {
  const fetchMock = vi.fn(
    (_input: Parameters<typeof fetch>[0], options?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        options?.signal?.addEventListener(
          'abort',
          () => reject(options.signal?.reason),
          { once: true },
        );
      }),
  );

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('aborts a stalled request when its request deadline expires', async () => {
    const deadline = new AbortController();
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(deadline.signal);
    stubPendingFetch();
    const request = fetchWithTimeout('https://recall.example.com/recording');
    const assertion = expect(request).rejects.toMatchObject({
      name: 'TimeoutError',
    });

    deadline.abort(new DOMException('Request timed out', 'TimeoutError'));
    await assertion;
  });

  it('preserves an earlier invocation deadline supplied by the caller', async () => {
    const invocation = new AbortController();
    stubPendingFetch();
    const request = fetchWithTimeout('https://recall.example.com/recording', {
      signal: invocation.signal,
    });
    const assertion = expect(request).rejects.toMatchObject({
      name: 'AbortError',
    });

    invocation.abort();
    await assertion;
  });

  it('preserves the cancellation signal carried by a Request', async () => {
    const invocation = new AbortController();
    stubPendingFetch();
    const request = fetchWithTimeout(
      new Request('https://recall.example.com/recording', {
        signal: invocation.signal,
      }),
    );
    const assertion = expect(request).rejects.toMatchObject({
      name: 'AbortError',
    });

    invocation.abort();
    await assertion;
  });
});
