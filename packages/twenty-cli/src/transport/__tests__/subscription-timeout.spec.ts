import { setTimeout as delay } from 'node:timers/promises';

import { afterEach, expect, it, vi } from 'vitest';

import { startTestServer } from '@/__tests__/utils/start-test-server';
import { subscribeGraphql } from '@/transport/graphql/subscribe-graphql';

vi.mock('@/transport/constants/request-timeout-milliseconds.constant', () => ({
  REQUEST_TIMEOUT_MILLISECONDS: 500,
}));

afterEach(() => vi.unstubAllEnvs());

const subscribe = (url: string, onData: (data: unknown) => Promise<void>) => {
  for (const name of [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'http_proxy',
    'https_proxy',
  ]) {
    vi.stubEnv(name, undefined);
  }
  return subscribeGraphql({
    target: {
      apiUrl: url,
      bearerToken: 'test',
      credentialKind: 'apiKey',
      source: 'environment',
    },
    signal: new AbortController().signal,
    query: 'subscription { logs }',
    variables: {},
    onConnected: async () => {},
    onData,
  });
};

it('reports a stalled connection after its last record without reconnecting', async () => {
  const server = await startTestServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    response.write('event: next\ndata: {"data":{"logs":"first"}}\n\n');
  });
  const records: unknown[] = [];
  try {
    await expect(
      subscribe(server.url, async (data) => {
        records.push(data);
      }),
    ).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      details: { networkCode: 'UND_ERR_BODY_TIMEOUT' },
    });
    expect(records).toEqual([{ logs: 'first' }]);
    expect(server.requests).toHaveLength(1);
  } finally {
    await server.close();
  }
}, 10_000);

it('keeps a quiet subscription alive while receiving server heartbeat comments', async () => {
  const server = await startTestServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    response.write(':\n\n');
    const heartbeat = setInterval(() => response.write(':\n\n'), 100);
    const completion = setTimeout(
      () => response.end('event: complete\n\n'),
      2_000,
    );
    response.on('close', () => {
      clearInterval(heartbeat);
      clearTimeout(completion);
    });
  });
  try {
    await expect(
      subscribe(server.url, async () => {}),
    ).resolves.toBeUndefined();
    expect(server.requests).toHaveLength(1);
  } finally {
    await server.close();
  }
}, 10_000);

it('does not time out a body paused by slow output', async () => {
  const server = await startTestServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    response.end(
      'event: next\ndata: {"data":{"logs":"first"}}\n\n:' +
        'x'.repeat(2 * 1024 * 1024) +
        '\n\nevent: complete\n\n',
    );
  });
  try {
    await expect(
      subscribe(server.url, async () => {
        await delay(2_000);
      }),
    ).resolves.toBeUndefined();
    expect(server.requests).toHaveLength(1);
  } finally {
    await server.close();
  }
}, 10_000);
