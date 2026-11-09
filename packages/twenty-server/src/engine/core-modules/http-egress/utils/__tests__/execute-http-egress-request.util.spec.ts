import * as http from 'http';
import { type AddressInfo } from 'net';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type HttpEgressRequest } from 'src/engine/core-modules/http-egress/types/http-egress-request.type';
import { executeHttpEgressRequest } from 'src/engine/core-modules/http-egress/utils/execute-http-egress-request.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const DEFAULT_LIMITS: HttpEgressRequest['limits'] = {
  timeoutMs: 5_000,
  maxPayloadSizeBytes: 1024 * 1024,
};

const buildHttpClient = (allowedInternalHosts: string[]) =>
  new SecureHttpClientService({
    get: (key: string) =>
      key === 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS'
        ? allowedInternalHosts
        : undefined,
  } as unknown as TwentyConfigService).getHttpClient();

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
      { input, limits },
      buildHttpClient(allowedInternalHosts),
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
          case '/redirect-to-metadata':
            response.statusCode = 302;
            response.setHeader(
              'location',
              'http://169.254.169.254/latest/meta-data/',
            );
            response.end();

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

  it('should return parsed JSON with status, headers and the resolved address', async () => {
    const { toolOutput, diagnostics } = await execute({
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
    expect(diagnostics).toMatchObject({
      outcome: 'success',
      status: 200,
      resolvedAddress: '127.0.0.1',
    });
  });

  it('should return a text body as a string', async () => {
    const { toolOutput } = await execute({
      url: `${baseUrl}/text`,
      method: 'GET',
    });

    expect(toolOutput).toMatchObject({ success: true, result: 'hello' });
  });

  it('should map a non-2xx response to an error with its body', async () => {
    const { toolOutput, diagnostics } = await execute({
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
    expect(diagnostics).toMatchObject({ outcome: 'http_error', status: 404 });
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
    'should encode a %s body',
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

  it('should send a multipart body with a generated boundary', async () => {
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

  it('should not send a body with GET', async () => {
    const { toolOutput } = await execute({
      url: `${baseUrl}/echo`,
      method: 'GET',
      body: { ignored: true },
    });

    expect(toolOutput.result).toMatchObject({ method: 'GET', body: '' });
  });

  it('should report a loopback request as blocked when it is not allowlisted', async () => {
    const { toolOutput, diagnostics } = await execute(
      { url: `${baseUrl}/json`, method: 'GET' },
      { allowedInternalHosts: [] },
    );

    expect(toolOutput.success).toBe(false);
    expect(toolOutput.error).toBe(
      'Request to internal IP address 127.0.0.1 is not allowed.',
    );
    expect(diagnostics).toMatchObject({
      outcome: 'blocked',
      resolvedAddress: '127.0.0.1',
    });
  });

  it('should report a redirect to the metadata address as blocked', async () => {
    const { toolOutput, diagnostics } = await execute({
      url: `${baseUrl}/redirect-to-metadata`,
      method: 'GET',
    });

    expect(toolOutput.success).toBe(false);
    expect(diagnostics).toMatchObject({
      outcome: 'blocked',
      resolvedAddress: '169.254.169.254',
    });
  });

  it('should report a timeout', async () => {
    const { toolOutput, diagnostics } = await execute(
      { url: `${baseUrl}/slow`, method: 'GET' },
      { limits: { ...DEFAULT_LIMITS, timeoutMs: 200 } },
    );

    expect(toolOutput).toMatchObject({
      success: false,
      error: 'Request timed out after 0.2s',
    });
    expect(diagnostics.outcome).toBe('timeout');
  });

  it('should report a response over the payload limit', async () => {
    const { toolOutput, diagnostics } = await execute(
      { url: `${baseUrl}/large`, method: 'GET' },
      { limits: { ...DEFAULT_LIMITS, maxPayloadSizeBytes: 1024 } },
    );

    expect(toolOutput.success).toBe(false);
    expect(diagnostics.outcome).toBe('payload_too_large');
  });

  it('should report a body that cannot be encoded as an invalid request', async () => {
    const { toolOutput, diagnostics } = await execute({
      url: `${baseUrl}/echo`,
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: 'not json',
    });

    expect(toolOutput).toMatchObject({
      success: false,
      error: 'String data for FormData must be valid JSON',
    });
    expect(diagnostics.outcome).toBe('invalid_request');
  });
});
