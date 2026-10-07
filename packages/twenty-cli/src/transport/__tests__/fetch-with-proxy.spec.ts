import { createServer } from 'node:http';
import { connect, type Socket } from 'node:net';

import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';
import { getListeningPort } from '@/utils/get-listening-port';

const proxyRequests: { authority: string; authorization?: string }[] = [];
const sockets = new Set<Socket>();
const target = await startTestServer((request, response) => {
  if (request.headers.accept === 'text/event-stream') {
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    response.end(
      'event: next\ndata: {"data":{"message":"hello"}}\n\nevent: complete\n\n',
    );
    return;
  }
  sendJson(response, 200, { ok: true });
});
const proxy = createServer();

proxy.on('connection', (socket) => {
  sockets.add(socket);
  socket.on('close', () => sockets.delete(socket));
});
proxy.on('connect', (request, socket, head) => {
  proxyRequests.push({
    authority: request.url ?? '',
    authorization: request.headers['proxy-authorization'],
  });

  if (request.url === 'secure.example:443') {
    socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');

    return;
  }

  const upstream = connect(
    Number(new URL(target.url).port),
    '127.0.0.1',
    () => {
      socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      upstream.write(head);
      socket.pipe(upstream);
      upstream.pipe(socket);
    },
  );

  socket.on('close', () => upstream.destroy());
  upstream.on('error', () => socket.destroy());
});
await new Promise<void>((resolve) => proxy.listen(0, '127.0.0.1', resolve));
const proxyUrl = `http://127.0.0.1:${getListeningPort(proxy)}`;

const fetchThroughTransport = async (url: string) => {
  const { createBoundedFetch } =
    await import('@/transport/create-target-fetch');

  return createBoundedFetch({
    apiUrl: url,
    bearerToken: 'workspace-secret',
    signal: new AbortController().signal,
  })(url);
};

describe('environment proxies', () => {
  beforeEach(() => {
    vi.resetModules();
    for (const name of [
      'HTTP_PROXY',
      'HTTPS_PROXY',
      'NO_PROXY',
      'http_proxy',
      'https_proxy',
      'no_proxy',
    ]) {
      vi.stubEnv(name, undefined);
    }
    proxyRequests.length = 0;
    target.requests.length = 0;
  });

  afterEach(() => {
    for (const socket of sockets) {
      socket.destroy();
    }
    vi.unstubAllEnvs();
  });

  afterAll(async () => {
    await target.close();
    await new Promise<void>((resolve) => proxy.close(() => resolve()));
  });

  it.each(['HTTP_PROXY', 'http_proxy'])(
    'routes HTTP through %s',
    async (name) => {
      vi.stubEnv(name, proxyUrl);

      const response = await fetchThroughTransport(
        'http://unresolvable.example',
      );

      expect(await response.json()).toEqual({ ok: true });
      expect(proxyRequests).toEqual([
        { authority: 'unresolvable.example:80', authorization: undefined },
      ]);
      expect(target.requests[0].headers.authorization).toBe(
        'Bearer workspace-secret',
      );
    },
  );

  it.each(['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY'])(
    'routes HTTPS CONNECT through %s',
    async (name) => {
      vi.stubEnv(name, proxyUrl);

      await expect(
        fetchThroughTransport('https://secure.example'),
      ).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
      expect(proxyRequests).toEqual([
        { authority: 'secure.example:443', authorization: undefined },
      ]);
    },
  );

  it.each(['NO_PROXY', 'no_proxy'])(
    'bypasses the proxy using %s',
    async (name) => {
      vi.stubEnv('HTTP_PROXY', proxyUrl);
      vi.stubEnv(name, '127.0.0.1');

      expect((await fetchThroughTransport(target.url)).status).toBe(200);
      expect(proxyRequests).toEqual([]);
      expect(target.requests).toHaveLength(1);
    },
  );

  it('lets lowercase settings override uppercase settings', async () => {
    vi.stubEnv('HTTP_PROXY', 'http://unreachable.invalid');
    vi.stubEnv('http_proxy', proxyUrl);
    vi.stubEnv('NO_PROXY', '*');
    vi.stubEnv('no_proxy', '');

    expect(
      (await fetchThroughTransport('http://unresolvable.example')).status,
    ).toBe(200);
    expect(proxyRequests).toHaveLength(1);
  });

  it('sends proxy credentials only to the proxy', async () => {
    vi.stubEnv(
      'HTTP_PROXY',
      proxyUrl.replace('http://', 'http://proxy-user:proxy-secret@'),
    );

    expect(
      (await fetchThroughTransport('http://unresolvable.example')).status,
    ).toBe(200);
    expect(proxyRequests[0].authorization).toBe(
      `Basic ${Buffer.from('proxy-user:proxy-secret').toString('base64')}`,
    );
    expect(target.requests[0].headers['proxy-authorization']).toBeUndefined();
    expect(target.requests[0].headers.authorization).toBe(
      'Bearer workspace-secret',
    );
  });

  it('does not expose proxy credentials in invalid-configuration errors', async () => {
    vi.stubEnv('HTTP_PROXY', 'http://proxy-user:proxy-secret@[');

    await expect(fetchThroughTransport(target.url)).rejects.toMatchObject({
      code: 'INVALID_CONFIG',
      message: 'Could not configure the network proxy.',
      details: undefined,
    });
  });

  it('routes signed uploads through the same proxy', async () => {
    vi.stubEnv('HTTP_PROXY', proxyUrl);
    const { putUploadFile } = await import('@/app/deployment/put-upload-file');

    expect(
      await putUploadFile({
        uploadUrl: 'http://uploads.example/file?signature=secret',
        contentType: 'text/plain',
        bytes: new TextEncoder().encode('file contents'),
        signal: new AbortController().signal,
      }),
    ).toBe(200);
    expect(proxyRequests[0].authority).toBe('uploads.example:80');
    expect(target.requests[0]).toMatchObject({
      method: 'PUT',
      body: 'file contents',
    });
    expect(target.requests[0].headers.authorization).toBeUndefined();
  });

  it('streams subscriptions through the proxy without forwarding proxy credentials', async () => {
    vi.stubEnv(
      'HTTP_PROXY',
      proxyUrl.replace('http://', 'http://proxy-user:proxy-secret@'),
    );
    const { subscribeGraphql } =
      await import('@/transport/graphql/subscribe-graphql');
    const records: unknown[] = [];

    await subscribeGraphql({
      target: {
        apiUrl: 'http://unresolvable.example',
        bearerToken: 'workspace-secret',
        credentialKind: 'apiKey',
        source: 'environment',
      },
      signal: new AbortController().signal,
      query: 'subscription { message }',
      variables: {},
      onConnected: async () => {},
      onData: async (data) => {
        records.push(data);
      },
    });

    expect(records).toEqual([{ message: 'hello' }]);
    expect(proxyRequests).toHaveLength(1);
    expect(proxyRequests[0].authority).toBe('unresolvable.example:80');
    expect(target.requests[0].path).toBe('/metadata');
    expect(target.requests[0].headers.authorization).toBe(
      'Bearer workspace-secret',
    );
    expect(target.requests[0].headers['proxy-authorization']).toBeUndefined();
  });
});
