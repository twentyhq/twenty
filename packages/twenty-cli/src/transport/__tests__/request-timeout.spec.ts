import { afterEach, describe, expect, it, vi } from 'vitest';

import { createBoundedFetch } from '@/transport/create-target-fetch';
import { fetchWithProxy } from '@/transport/fetch-with-proxy';
import { subscribeGraphql } from '@/transport/graphql/subscribe-graphql';

vi.mock('@/transport/fetch-with-proxy');
afterEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

describe('request-specific transport timeout', () => {
  it('ends a request at its configured deadline and reports that deadline', async () => {
    vi.mocked(fetchWithProxy).mockImplementation(
      async (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(init.signal?.reason),
            { once: true },
          );
        }),
    );
    const request = createBoundedFetch({
      apiUrl: 'https://example.test',
      signal: new AbortController().signal,
      timeoutMilliseconds: 20,
    });

    await expect(
      request('https://example.test/metadata'),
    ).rejects.toMatchObject({
      code: 'TIMEOUT',
      message: 'https://example.test did not answer within 0.02 seconds.',
    });
    expect(fetchWithProxy).toHaveBeenCalledOnce();
  });

  it('still cancels a long-running request immediately on user interruption', async () => {
    const controller = new AbortController();
    vi.mocked(fetchWithProxy).mockImplementation(
      async (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(init.signal?.reason),
            { once: true },
          );
        }),
    );
    const request = createBoundedFetch({
      apiUrl: 'https://example.test',
      signal: controller.signal,
      timeoutMilliseconds: 360_000,
    });
    const response = request('https://example.test/metadata');
    controller.abort();

    await expect(response).rejects.toBe(controller.signal.reason);
    expect(fetchWithProxy).toHaveBeenCalledOnce();
  });

  it('limits subscription connection setup to 60 seconds', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchWithProxy).mockImplementation(
      async (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(init.signal?.reason),
            { once: true },
          );
        }),
    );
    const subscription = subscribeGraphql({
      target: {
        apiUrl: 'https://example.test',
        bearerToken: 'test',
        credentialKind: 'apiKey',
        source: 'environment',
      },
      signal: new AbortController().signal,
      query: 'subscription { logs }',
      variables: {},
      onConnected: async () => {},
      onData: async () => {},
    });
    const assertion = expect(subscription).rejects.toMatchObject({
      code: 'TIMEOUT',
    });
    await vi.advanceTimersByTimeAsync(60_000);
    await assertion;
    expect(fetchWithProxy).toHaveBeenCalledOnce();
  });

  it('clears the connection deadline while waiting for future log records', async () => {
    vi.useFakeTimers();
    const connected = Promise.withResolvers<void>();
    const stream = new TransformStream<Uint8Array>();
    const writer = stream.writable.getWriter();
    vi.mocked(fetchWithProxy).mockResolvedValue(
      new Response(stream.readable, {
        headers: { 'content-type': 'text/event-stream' },
      }),
    );
    const records: unknown[] = [];
    const subscription = subscribeGraphql({
      target: {
        apiUrl: 'https://example.test',
        bearerToken: 'test',
        credentialKind: 'apiKey',
        source: 'environment',
      },
      signal: new AbortController().signal,
      query: 'subscription { logs }',
      variables: {},
      onConnected: async () => {
        connected.resolve();
      },
      onData: async (data) => {
        records.push(data);
      },
    });
    await connected.promise;
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    await writer.write(
      Buffer.from(
        'event: next\ndata: {"data":{"logs":"late"}}\n\nevent: complete\n\n',
      ),
    );
    await subscription;
    expect(records).toEqual([{ logs: 'late' }]);
    expect(fetchWithProxy).toHaveBeenCalledOnce();
  });
});
