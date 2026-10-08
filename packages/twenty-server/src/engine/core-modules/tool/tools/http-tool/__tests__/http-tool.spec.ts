import * as http from 'http';
import { type AddressInfo } from 'net';

import axios from 'axios';

import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';

jest.mock(
  'src/engine/core-modules/tool/tools/http-tool/constants/http-tool-timeout-ms.constant',
  () => ({ HTTP_TOOL_TIMEOUT_MS: 500 }),
);

jest.mock(
  'src/engine/core-modules/tool/tools/http-tool/constants/http-tool-max-payload-size-bytes.constant',
  () => ({ HTTP_TOOL_MAX_PAYLOAD_SIZE_BYTES: 1024 }),
);

const CONTEXT = { workspaceId: '20202020-0000-4000-8000-000000000001' };

describe('HttpTool', () => {
  const httpTool = new HttpTool({
    getHttpClient: () => axios.create(),
  } as unknown as SecureHttpClientService);

  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = http.createServer((request, response) => {
      response.writeHead(200, { 'content-type': 'application/json' });

      if (request.url === '/trickle') {
        const interval = setInterval(() => response.write(' '), 100);

        response.on('close', () => clearInterval(interval));

        return;
      }

      if (request.url === '/oversized') {
        response.end(JSON.stringify({ data: 'x'.repeat(2048) }));

        return;
      }

      response.end(JSON.stringify({ ok: true }));
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

  it('should return the response of a server that answers', async () => {
    const output = await httpTool.execute(
      { url: `${baseUrl}/ok`, method: 'GET' },
      CONTEXT,
    );

    expect(output).toMatchObject({
      success: true,
      status: 200,
      result: { ok: true },
    });
  });

  it('should fail when the response keeps trickling past the timeout', async () => {
    const output = await httpTool.execute(
      { url: `${baseUrl}/trickle`, method: 'GET' },
      CONTEXT,
    );

    expect(output).toMatchObject({
      success: false,
      error: 'Request timed out after 0.5s',
    });
  });

  it('should fail when the response exceeds the payload size limit', async () => {
    const output = await httpTool.execute(
      { url: `${baseUrl}/oversized`, method: 'GET' },
      CONTEXT,
    );

    expect(output.success).toBe(false);
    expect(output.error).toContain('maxContentLength');
  });

  it('should fail when the request body exceeds the payload size limit', async () => {
    const output = await httpTool.execute(
      {
        url: `${baseUrl}/ok`,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: { data: 'x'.repeat(2048) },
      },
      CONTEXT,
    );

    expect(output.success).toBe(false);
    expect(output.error).toContain('maxBodyLength');
  });
});
