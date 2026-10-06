import { Agent, getGlobalDispatcher, setGlobalDispatcher } from 'undici';
import { afterEach, expect, it, vi } from 'vitest';

import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';
import { createBoundedFetch } from '@/transport/create-target-fetch';
import { subscribeGraphql } from '@/transport/graphql/subscribe-graphql';

afterEach(() => vi.unstubAllEnvs());

it('allows an execution to outlast the HTTP dispatcher header deadline', async () => {
  for (const name of [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'http_proxy',
    'https_proxy',
  ]) {
    vi.stubEnv(name, undefined);
  }
  const server = await startTestServer((_request, response) => {
    setTimeout(() => sendJson(response, 200, { completed: true }), 2_000);
  });
  const originalDispatcher = getGlobalDispatcher();
  const shortDeadlineDispatcher = new Agent({ headersTimeout: 1 });
  setGlobalDispatcher(shortDeadlineDispatcher);

  try {
    await expect(fetch(server.url)).rejects.toMatchObject({
      cause: { code: 'UND_ERR_HEADERS_TIMEOUT' },
    });
    const request = createBoundedFetch({
      apiUrl: server.url,
      signal: new AbortController().signal,
      timeoutMilliseconds: 5_000,
    });

    const response = await request(server.url);

    expect(await response.json()).toEqual({ completed: true });
  } finally {
    setGlobalDispatcher(originalDispatcher);
    await shortDeadlineDispatcher.destroy();
    await server.close();
  }
}, 10_000);

it('keeps an idle subscription open past the HTTP dispatcher body deadline', async () => {
  for (const name of [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'http_proxy',
    'https_proxy',
  ]) {
    vi.stubEnv(name, undefined);
  }
  const server = await startTestServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    response.write(':\n\n');
    setTimeout(() => response.end('event: complete\n\n'), 2_000);
  });
  const originalDispatcher = getGlobalDispatcher();
  const shortDeadlineDispatcher = new Agent({ bodyTimeout: 1 });
  setGlobalDispatcher(shortDeadlineDispatcher);

  try {
    const response = await fetch(server.url);
    await expect(response.text()).rejects.toMatchObject({
      cause: { code: 'UND_ERR_BODY_TIMEOUT' },
    });
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
        onConnected: async () => {},
        onData: async () => {},
      }),
    ).resolves.toBeUndefined();
  } finally {
    setGlobalDispatcher(originalDispatcher);
    await shortDeadlineDispatcher.destroy();
    await server.close();
  }
}, 10_000);
