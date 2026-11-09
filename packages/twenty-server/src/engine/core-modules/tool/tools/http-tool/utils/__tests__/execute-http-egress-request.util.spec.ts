import * as http from 'http';
import { type AddressInfo } from 'net';

import { createSsrfSafeAxiosClient } from 'src/engine/core-modules/secure-http-client/utils/create-ssrf-safe-axios-client.util';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { executeHttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/utils/execute-http-egress-request.util';

const CONTEXT: HttpEgressRequest['context'] = {
  workspaceId: 'workspace-id',
  source: 'workflow-http',
};

const DEFAULT_LIMITS: HttpEgressRequest['limits'] = {
  timeoutMs: 5_000,
  maxPayloadSizeBytes: 1024 * 1024,
};

describe('executeHttpEgressRequest', () => {
  let server: http.Server;
  let baseUrl: string;

  const execute = (
    input: HttpEgressRequest['input'],
    {
      allowedInternalHosts = ['127.0.0.1'],
      limits = DEFAULT_LIMITS,
    }: {
      allowedInternalHosts?: string[];
      limits?: HttpEgressRequest['limits'];
    } = {},
  ) =>
    executeHttpEgressRequest(
      { input, limits, context: CONTEXT },
      createSsrfSafeAxiosClient({ allowedInternalHosts }),
    );

  beforeAll(async () => {
    jest.useRealTimers();

    server = http.createServer((request, response) => {
      let body = '';

      request.on('data', (chunk) => (body += chunk));
      request.on('end', () => {
        switch (request.url) {
          case '/json':
            response.setHeader('content-type', 'application/json');
            response.setHeader('set-cookie', ['a=1', 'b=2']);
            response.end(JSON.stringify({ ok: true }));

            return;
          case '/text':
            response.end('hello');

            return;
          case '/not-found':
            response.statusCode = 404;
            response.setHeader('content-type', 'application/json');
            response.end(JSON.stringify({ error: 'nope' }));

            return;
          case '/large':
            response.end('x'.repeat(2048));

            return;
          case '/slow':
            setTimeout(() => response.end('late'), 2_000);

            return;
          case '/echo':
            response.setHeader('content-type', 'application/json');
            response.end(
              JSON.stringify({
                method: request.method,
                contentType: request.headers['content-type'],
                body,
              }),
            );

            return;
          default:
            response.end();
        }
      });
    });

    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });

  it('returns parsed JSON with status and headers', async () => {
    const { toolOutput, outcomeDetails } = await execute({
      url: `${baseUrl}/json`,
      method: 'GET',
    });

    expect(toolOutput).toMatchObject({
      success: true,
      message: `HTTP GET request to ${baseUrl}/json completed successfully`,
      result: { ok: true },
      status: 200,
      statusText: 'OK',
    });
    expect(toolOutput.headers?.['set-cookie']).toEqual(['a=1', 'b=2']);
    expect(outcomeDetails).toMatchObject({ outcome: 'success', status: 200 });
  });

  it('returns a text body as a string', async () => {
    const { toolOutput } = await execute({
      url: `${baseUrl}/text`,
      method: 'GET',
    });

    expect(toolOutput).toMatchObject({ success: true, result: 'hello' });
  });

  it('maps a non-2xx response to an error with its body', async () => {
    const { toolOutput, outcomeDetails } = await execute({
      url: `${baseUrl}/not-found`,
      method: 'GET',
    });

    expect(toolOutput).toMatchObject({
      success: false,
      message: `HTTP GET request to ${baseUrl}/not-found failed`,
      error: { error: 'nope' },
      result: { error: 'nope' },
      status: 404,
    });
    expect(outcomeDetails).toMatchObject({
      outcome: 'http-error',
      status: 404,
    });
  });

  it.each([
    [
      'application/json',
      { name: 'Acme', count: 3 },
      'application/json',
      '{"name":"Acme","count":3}',
    ],
    [
      'application/x-www-form-urlencoded',
      { a: '1', b: 'two words' },
      'application/x-www-form-urlencoded',
      'a=1&b=two+words',
    ],
    ['text/plain', { a: '1', b: 'two' }, 'text/plain', 'a=1\nb=two'],
  ])(
    'encodes a %s body',
    async (contentType, body, expectedContentType, expectedBody) => {
      const { toolOutput } = await execute({
        url: `${baseUrl}/echo`,
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body,
      });

      expect(toolOutput.result).toEqual({
        method: 'POST',
        contentType: expectedContentType,
        body: expectedBody,
      });
    },
  );

  it('sends a multipart body with a generated boundary', async () => {
    const { toolOutput } = await execute({
      url: `${baseUrl}/echo`,
      method: 'PUT',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: { a: '1', b: 'two' },
    });

    const result = toolOutput.result as { contentType: string; body: string };

    expect(result.contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(result.body).toContain('name="b"');
  });

  it('reports a request blocked by the SSRF guard', async () => {
    const { toolOutput, outcomeDetails } = await execute(
      { url: `${baseUrl}/json`, method: 'GET' },
      { allowedInternalHosts: [] },
    );

    expect(toolOutput).toMatchObject({
      success: false,
      error: 'Request to internal IP address 127.0.0.1 is not allowed.',
    });
    expect(outcomeDetails).toMatchObject({
      outcome: 'blocked',
      reason: 'Request to internal IP address 127.0.0.1 is not allowed.',
    });
  });

  it('reports a timeout', async () => {
    const { toolOutput, outcomeDetails } = await execute(
      { url: `${baseUrl}/slow`, method: 'GET' },
      { limits: { ...DEFAULT_LIMITS, timeoutMs: 200 } },
    );

    expect(toolOutput).toMatchObject({
      success: false,
      error: 'Request timed out after 0.2s',
    });
    expect(outcomeDetails.outcome).toBe('timeout');
  });

  it('refuses a response over the payload limit', async () => {
    const { toolOutput } = await execute(
      { url: `${baseUrl}/large`, method: 'GET' },
      { limits: { ...DEFAULT_LIMITS, maxPayloadSizeBytes: 1024 } },
    );

    expect(toolOutput).toMatchObject({
      success: false,
      error: 'maxContentLength size of 1024 exceeded',
    });
  });
});
