import { Test } from '@nestjs/testing';

import { createServer, type Server } from 'node:http';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { type HttpRequestInput } from 'src/engine/core-modules/tool/tools/http-tool/types/http-request-input.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const HEADER_NAMES = [
  'content-type',
  'Content-Type',
  'CONTENT-TYPE',
  'cOnTeNt-TyPe',
];

describe('HttpTool request serialization', () => {
  let server: Server;
  let url: string;
  let tool: HttpTool;

  beforeAll(async () => {
    jest.useRealTimers();
    server = createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on('data', (chunk: Buffer) => chunks.push(chunk));
      request.on('end', () => {
        response.setHeader('Content-Type', 'application/json');
        response.end(
          JSON.stringify({
            method: request.method,
            headers: request.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          }),
        );
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Expected a TCP server address');
    }
    url = `http://127.0.0.1:${address.port}`;

    const module = await Test.createTestingModule({
      providers: [
        HttpTool,
        SecureHttpClientService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: (key: string) =>
              key === 'OUTBOUND_HTTP_SAFE_MODE_ENABLED' ? true : ['127.0.0.1'],
          },
        },
      ],
    }).compile();
    tool = module.get(HttpTool);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    jest.useFakeTimers();
  });

  const execute = (input: Omit<HttpRequestInput, 'url'>) =>
    tool.execute({ url, ...input }, { workspaceId: WORKSPACE_ID });

  it.each(HEADER_NAMES)(
    'encodes form data with %s and leaves the input headers unchanged',
    async (headerName) => {
      const headers = {
        [headerName]: 'application/x-www-form-urlencoded',
        'X-Request-Id': 'test-request',
      };
      const output = await execute({
        method: 'POST',
        headers,
        body: { name: 'Alice & Bob', count: 0 },
      });
      expect(output).toMatchObject({
        success: true,
        result: {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'x-request-id': 'test-request',
          },
          body: 'name=Alice+%26+Bob&count=0',
        },
      });
      expect(headers).toEqual({
        [headerName]: 'application/x-www-form-urlencoded',
        'X-Request-Id': 'test-request',
      });
    },
  );

  it.each(HEADER_NAMES)(
    'sends a multipart boundary with %s',
    async (headerName) => {
      const headers = { [headerName]: 'multipart/form-data' };
      const output = await execute({
        method: 'POST',
        headers,
        body: { name: 'Alice' },
      });
      expect(output).toMatchObject({
        success: true,
        result: {
          headers: {
            'content-type': expect.stringMatching(
              /^multipart\/form-data; boundary=/,
            ),
          },
          body: expect.stringContaining('name="name"\r\n\r\nAlice\r\n'),
        },
      });
      expect(headers).toEqual({ [headerName]: 'multipart/form-data' });
    },
  );

  it.each(['POST', 'PUT', 'PATCH'] as const)(
    'preserves JSON false and zero in %s requests',
    async (method) => {
      for (const body of [false, 0]) {
        expect(
          await execute({
            method,
            headers: { 'Content-Type': 'application/json' },
            body,
          }),
        ).toMatchObject({
          success: true,
          result: { method, body: JSON.stringify(body) },
        });
      }
    },
  );

  it.each([false, 0])('preserves %s without explicit headers', async (body) => {
    expect(await execute({ method: 'POST', body })).toMatchObject({
      success: true,
      result: { body: JSON.stringify(body) },
    });
  });

  it('preserves an empty text body', async () => {
    expect(
      await execute({
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '',
      }),
    ).toMatchObject({
      success: true,
      result: { body: '', headers: { 'content-type': 'text/plain' } },
    });
  });

  it.each([undefined, null])(
    'does not serialize an absent body (%s)',
    async (body) => {
      expect(await execute({ method: 'POST', body })).toMatchObject({
        success: true,
        result: { body: '' },
      });
    },
  );

  it.each(['GET', 'DELETE'] as const)(
    'does not add a body to %s requests',
    async (method) => {
      expect(await execute({ method, body: { ignored: true } })).toMatchObject({
        success: true,
        result: { method, body: '' },
      });
    },
  );

  it('preserves JSON object serialization', async () => {
    expect(
      await execute({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { active: false, count: 0 },
      }),
    ).toMatchObject({
      success: true,
      result: { body: '{"active":false,"count":0}' },
    });
  });
});
