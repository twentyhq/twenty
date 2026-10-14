import { afterEach, expect, it, vi } from 'vitest';

import { startTestServer } from '@/__tests__/utils/start-test-server';
import { subscribeGraphql } from '@/transport/graphql/subscribe-graphql';

vi.mock('@/transport/constants/request-timeout-milliseconds.constant', () => ({
  REQUEST_TIMEOUT_MILLISECONDS: 500,
}));

afterEach(() => vi.unstubAllEnvs());

it.each([
  {
    status: 500,
    contentType: 'text/event-stream',
    body: ':\n\nevent: next\ndata: {"errors":[{"message":"Sign in to export records."}]}\n\nevent: complete\n\n',
    code: 'GRAPHQL_ERROR',
    message: 'Sign in to export records.',
  },
  {
    status: 403,
    contentType: 'text/event-stream; charset=utf-8',
    body: 'event: next\ndata: {"errors":[{"message":"Export permission required."}]}\n\n',
    code: 'PERMISSION_DENIED',
    message: 'Export permission required.',
  },
  {
    status: 500,
    contentType: 'text/event-stream',
    body: 'event: complete\n\n',
    code: 'HTTP_ERROR',
    message: 'The server answered 500.',
  },
  {
    status: 500,
    contentType: 'text/event-stream',
    body: 'event: next\ndata: {"data":{"logs":"unexpected success"}}\n\n',
    code: 'HTTP_ERROR',
    message: 'The server answered 500.',
  },
  {
    status: 503,
    contentType: 'application/json',
    body: '{"message":"Service unavailable"}',
    code: 'HTTP_ERROR',
    message: 'The server answered 503: Service unavailable',
  },
])(
  'reports $status $contentType: $message',
  async ({ status, contentType, body, code, message }) => {
    for (const name of [
      'HTTP_PROXY',
      'HTTPS_PROXY',
      'http_proxy',
      'https_proxy',
    ]) {
      vi.stubEnv(name, undefined);
    }
    const server = await startTestServer((_request, response) => {
      response.writeHead(status, { 'content-type': contentType });
      response.end(body);
    });
    const onData = vi.fn(async () => {});
    const onConnected = vi.fn(async () => {});
    try {
      await expect(
        subscribeGraphql({
          target: {
            apiUrl: server.url,
            bearerToken: 'test',
            credentialKind: 'apiKey',
            source: 'environment',
          },
          signal: new AbortController().signal,
          query: 'subscription { logs }',
          variables: {},
          onConnected,
          onData,
        }),
      ).rejects.toMatchObject({ code, message, details: { status } });
      expect(onData).not.toHaveBeenCalled();
      expect(onConnected).not.toHaveBeenCalled();
      expect(server.requests).toHaveLength(1);
    } finally {
      await server.close();
    }
  },
);

it('times out an unsuccessful response that only sends heartbeat comments', async () => {
  for (const name of [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'http_proxy',
    'https_proxy',
  ]) {
    vi.stubEnv(name, undefined);
  }
  const server = await startTestServer((_request, response) => {
    response.writeHead(500, { 'content-type': 'text/event-stream' });
    response.write(':\n\n');
    const heartbeat = setInterval(() => response.write(':\n\n'), 100);
    response.on('close', () => clearInterval(heartbeat));
  });
  const onData = vi.fn(async () => {});
  const onConnected = vi.fn(async () => {});
  try {
    await expect(
      subscribeGraphql({
        target: {
          apiUrl: server.url,
          bearerToken: 'test',
          credentialKind: 'apiKey',
          source: 'environment',
        },
        signal: new AbortController().signal,
        query: 'subscription { logs }',
        variables: {},
        onConnected,
        onData,
      }),
    ).rejects.toMatchObject({ code: 'TIMEOUT' });
    expect(onConnected).not.toHaveBeenCalled();
    expect(onData).not.toHaveBeenCalled();
  } finally {
    await server.close();
  }
});
