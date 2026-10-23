import { createServer, type Server } from 'http';
import { gzipSync } from 'zlib';

import axios from 'axios';
import { isDefined } from 'twenty-shared/utils';

import { performLocalFetchRelayRequest } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/perform-local-fetch-relay-request.util';

describe('performLocalFetchRelayRequest', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = createServer((request, response) => {
      const chunks: Buffer[] = [];

      request.on('data', (chunk: Buffer) => chunks.push(chunk));
      request.on('end', () => {
        switch (request.url) {
          case '/echo':
            response.setHeader('content-type', 'application/json');
            response.setHeader('set-cookie', ['a=1', 'b=2']);
            response.end(
              JSON.stringify({
                method: request.method,
                authorization: request.headers.authorization,
                body: Buffer.concat(chunks).toString(),
              }),
            );
            break;
          case '/gzip':
            response.setHeader('content-encoding', 'gzip');
            response.end(gzipSync('compressed'));
            break;
          case '/empty':
            response.statusCode = 204;
            response.end();
            break;
          case '/slow':
            setTimeout(() => response.end('late'), 5_000).unref();
            break;
          case '/redirect':
            response.statusCode = 302;
            response.setHeader('location', '/echo');
            response.end();
            break;
          default:
            response.statusCode = 404;
            response.end('missing');
        }
      });
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));

    const address = server.address();

    if (!isDefined(address) || typeof address === 'string') {
      throw new Error('Test server is not listening on a TCP port');
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  const decode = (body?: string) =>
    Buffer.from(body ?? '', 'base64').toString();

  it('forwards the method, headers and body and returns the response', async () => {
    const response = await performLocalFetchRelayRequest({
      request: {
        url: `${baseUrl}/echo`,
        method: 'POST',
        headers: [
          ['authorization', 'Bearer token'],
          ['host', 'spoofed.example'],
        ],
        body: Buffer.from('payload').toString('base64'),
        redirect: 'follow',
      },
      httpClient: axios.create(),
    });

    expect(response.status).toBe(200);
    expect(JSON.parse(decode(response.body))).toEqual({
      method: 'POST',
      authorization: 'Bearer token',
      body: 'payload',
    });
    expect(response.headers).toEqual(
      expect.arrayContaining([
        ['content-type', 'application/json'],
        ['set-cookie', 'a=1'],
        ['set-cookie', 'b=2'],
      ]),
    );
  });

  it('returns decompressed bodies without the encoding headers', async () => {
    const response = await performLocalFetchRelayRequest({
      request: {
        url: `${baseUrl}/gzip`,
        method: 'GET',
        headers: [],
        redirect: 'follow',
      },
      httpClient: axios.create(),
    });

    expect(decode(response.body)).toBe('compressed');
    expect(response.headers.map(([name]) => name)).not.toContain(
      'content-encoding',
    );
  });

  it('returns error statuses and empty responses as they are', async () => {
    const httpClient = axios.create();

    const missing = await performLocalFetchRelayRequest({
      request: {
        url: `${baseUrl}/missing`,
        method: 'GET',
        headers: [],
        redirect: 'follow',
      },
      httpClient,
    });
    const empty = await performLocalFetchRelayRequest({
      request: {
        url: `${baseUrl}/empty`,
        method: 'GET',
        headers: [],
        redirect: 'follow',
      },
      httpClient,
    });

    expect(missing.status).toBe(404);
    expect(decode(missing.body)).toBe('missing');
    expect(empty.status).toBe(204);
    expect(empty.body).toBeUndefined();
  });

  it('only follows redirects when the request allows it', async () => {
    const httpClient = axios.create();

    const followed = await performLocalFetchRelayRequest({
      request: {
        url: `${baseUrl}/redirect`,
        method: 'GET',
        headers: [],
        redirect: 'follow',
      },
      httpClient,
    });
    const manual = await performLocalFetchRelayRequest({
      request: {
        url: `${baseUrl}/redirect`,
        method: 'GET',
        headers: [],
        redirect: 'manual',
      },
      httpClient,
    });

    expect(followed.status).toBe(200);
    expect(manual.status).toBe(302);
    expect(manual.headers).toContainEqual(['location', '/echo']);
  });

  it('stops the request when the signal aborts', async () => {
    const abortController = new AbortController();

    const pendingResponse = performLocalFetchRelayRequest({
      request: {
        url: `${baseUrl}/slow`,
        method: 'GET',
        headers: [],
        redirect: 'follow',
      },
      httpClient: axios.create(),
      signal: abortController.signal,
    });

    abortController.abort();

    await expect(pendingResponse).rejects.toThrow('canceled');
  });
});
