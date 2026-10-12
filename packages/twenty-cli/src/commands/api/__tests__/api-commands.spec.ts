import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { isDefined } from 'twenty-shared/utils';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';

const RESPONSE_CHUNK = 'x'.repeat(1024 * 1024);

const GRAPHQL_RESPONSES: [string, number, unknown][] = [
  [
    'partial',
    200,
    {
      data: { companies: { totalCount: 3 }, secret: null },
      errors: [{ message: 'secret failed', path: ['secret'] }],
    },
  ],
  ['unauthorized', 401, { errors: [{ message: 'Not authenticated' }] }],
  ['notGraphql', 200, { message: 'upstream failed' }],
  ['nullData', 200, { data: null }],
];

const server = await startTestServer((request, response) => {
  if (request.path === '/rest/companies' && request.method === 'GET') {
    return sendJson(
      response,
      200,
      { data: { companies: [] } },
      { 'x-request-id': 'request-200', 'set-cookie': 'session=secret' },
    );
  }

  if (request.path === '/rest/companies' && request.method === 'POST') {
    return sendJson(response, 201, { received: JSON.parse(request.body) });
  }

  if (request.path === '/rest/unauthorized') {
    return sendJson(response, 401, { messages: ['Token invalid.'] });
  }

  if (request.path === '/rest/forbidden') {
    return sendJson(response, 403, { message: 'Missing permission' });
  }

  if (request.path === '/rest/missing') {
    return sendJson(response, 404, { message: 'Record not found' });
  }

  if (request.path === '/rest/conflict') {
    return sendJson(response, 409, { message: 'Duplicate record' });
  }

  if (request.path === '/rest/broken') {
    return sendJson(
      response,
      500,
      { message: 'boom' },
      { 'x-request-id': 'request-500' },
    );
  }

  if (request.path === '/rest/redirect') {
    response.writeHead(302, {
      location: 'https://elsewhere.example.com/rest/companies',
    });

    return response.end();
  }

  if (request.path === '/rest/huge') {
    response.writeHead(200, { 'content-type': 'application/json' });

    for (let chunkIndex = 0; chunkIndex < 17; chunkIndex++) {
      response.write(RESPONSE_CHUNK);
    }

    return response.end();
  }

  if (request.path === '/rest/image') {
    response.writeHead(200, { 'content-type': 'image/png' });

    return response.end(Buffer.from([137, 80, 78, 71]));
  }

  if (request.path === '/metadata') {
    return sendJson(response, 200, {
      data: { currentWorkspace: { displayName: 'Acme' } },
    });
  }

  const graphqlResponse = GRAPHQL_RESPONSES.find(([marker]) =>
    request.body.includes(marker),
  );

  if (isDefined(graphqlResponse)) {
    return sendJson(response, graphqlResponse[1], graphqlResponse[2]);
  }

  return sendJson(response, 200, { data: { companies: { totalCount: 3 } } });
});

const runJson = async (args: string[]) => {
  const { stdout, exitCode } = await runCliForTest([...args, '--json']);

  return { envelope: parseSingleJsonLine(stdout), exitCode };
};

describe('api commands', () => {
  let inputDirectory: string;

  beforeAll(async () => {
    inputDirectory = await mkdtemp(join(tmpdir(), 'twenty-cli-api-spec-'));
  });

  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', 'test-key');
    vi.stubEnv('TWENTY_REMOTE', '');
    server.requests.length = 0;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  afterAll(async () => {
    await server.close();
  });

  it('sends an authenticated REST request and keeps only safe headers', async () => {
    const { envelope, exitCode } = await runJson([
      'api',
      'rest',
      '/rest/companies',
    ]);

    expect(exitCode).toBe(0);
    expect(envelope).toMatchObject({
      ok: true,
      command: 'api rest',
      target: { apiUrl: server.url, source: 'environment' },
      data: {
        status: 200,
        headers: { 'x-request-id': 'request-200' },
        body: { data: { companies: [] } },
      },
    });
    expect(envelope.data.headers).not.toHaveProperty('set-cookie');
    expect(server.requests[0].headers.authorization).toBe('Bearer test-key');
  });

  it.each([
    ['/rest/unauthorized', 'AUTH_REQUIRED', 3],
    ['/rest/forbidden', 'PERMISSION_DENIED', 3],
    ['/rest/missing', 'NOT_FOUND', 4],
    ['/rest/conflict', 'CONFLICT', 6],
    ['/rest/broken', 'HTTP_ERROR', 1],
  ])(
    'maps %s to %s with exit code %i',
    async (path, code, expectedExitCode) => {
      const { envelope, exitCode } = await runJson(['api', 'rest', path]);

      expect(exitCode).toBe(expectedExitCode);
      expect(envelope.error.code).toBe(code);
    },
  );

  it('keeps the request id on failures', async () => {
    const { envelope } = await runJson(['api', 'rest', '/rest/broken']);

    expect(envelope.error.details.headers['x-request-id']).toBe('request-500');
  });

  it('does not follow redirects', async () => {
    const { envelope, exitCode } = await runJson([
      'api',
      'rest',
      '/rest/redirect',
    ]);

    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'REDIRECT_NOT_FOLLOWED',
      details: { redirectOrigin: 'https://elsewhere.example.com' },
    });
    expect(server.requests).toHaveLength(1);
  });

  it('stops reading responses larger than 16 MiB', async () => {
    const { envelope } = await runJson(['api', 'rest', '/rest/huge']);

    expect(envelope.error.code).toBe('RESPONSE_LIMIT_EXCEEDED');
  });

  it('refuses binary response bodies', async () => {
    const { envelope } = await runJson(['api', 'rest', '/rest/image']);

    expect(envelope.error.code).toBe('UNSUPPORTED_RESPONSE_TYPE');
  });

  it('sends a JSON body read from a file', async () => {
    const inputPath = join(inputDirectory, 'company.json');

    await writeFile(inputPath, '{"name":"Linear"}');

    const { envelope, exitCode } = await runJson([
      'api',
      'rest',
      '/rest/companies',
      '--method',
      'POST',
      '--body',
      `@${inputPath}`,
    ]);

    expect(exitCode).toBe(0);
    expect(envelope.data.body).toEqual({ received: { name: 'Linear' } });
    expect(server.requests[0].headers['content-type']).toBe('application/json');
  });

  it.each([
    [['--body', '{"name":"Linear"}'], 'USAGE'],
    [['--method', 'POST', '--body', '{broken'], 'INVALID_INPUT'],
  ])(
    'rejects the body options %j before sending anything',
    async (options, code) => {
      const { envelope, exitCode } = await runJson([
        'api',
        'rest',
        '/rest/companies',
        ...options,
      ]);

      expect(exitCode).toBe(2);
      expect(envelope.error.code).toBe(code);
      expect(server.requests).toHaveLength(0);
    },
  );

  it('refuses absolute URLs without sending the credentials', async () => {
    const { envelope, exitCode } = await runJson([
      'api',
      'rest',
      'https://elsewhere.example.com/rest/companies',
    ]);

    expect(exitCode).toBe(2);
    expect(envelope.error.code).toBe('INVALID_REQUEST_PATH');
    expect(server.requests).toHaveLength(0);
  });

  it('returns GraphQL data from the core or metadata API', async () => {
    const core = await runJson([
      'api',
      'graphql',
      '--query',
      '{ companies { totalCount } }',
    ]);
    const metadata = await runJson([
      'api',
      'graphql',
      '--metadata',
      '--query',
      '{ currentWorkspace { displayName } }',
    ]);

    expect(core.envelope.data).toEqual({ companies: { totalCount: 3 } });
    expect(metadata.envelope.data).toEqual({
      currentWorkspace: { displayName: 'Acme' },
    });
    expect(server.requests.map((request) => request.path)).toEqual([
      '/graphql',
      '/metadata',
    ]);
  });

  it('keeps partial GraphQL data in the error details', async () => {
    const { envelope, exitCode } = await runJson([
      'api',
      'graphql',
      '--query',
      '{ partial }',
    ]);

    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'GRAPHQL_ERROR',
      message: 'secret failed',
      details: { data: { companies: { totalCount: 3 }, secret: null } },
    });
  });

  it.each([
    ['{ unauthorized }', 'AUTH_REQUIRED', 3],
    ['{ notGraphql }', 'INVALID_RESPONSE', 1],
  ])(
    'maps the GraphQL response to %s',
    async (query, code, expectedExitCode) => {
      const { envelope, exitCode } = await runJson([
        'api',
        'graphql',
        '--query',
        query,
      ]);

      expect(exitCode).toBe(expectedExitCode);
      expect(envelope.error.code).toBe(code);
    },
  );

  it('accepts a GraphQL result whose data is null', async () => {
    const { envelope, exitCode } = await runJson([
      'api',
      'graphql',
      '--query',
      '{ nullData }',
    ]);

    expect(exitCode).toBe(0);
    expect(envelope.data).toBeNull();
  });

  it.each([
    [['--query', '{ a }', '--variables', '[1]'], 'INVALID_INPUT'],
    [['--query', '-', '--variables', '-'], 'USAGE'],
  ])('rejects the GraphQL inputs %j', async (options, code) => {
    const { envelope, exitCode } = await runJson([
      'api',
      'graphql',
      ...options,
    ]);

    expect(exitCode).toBe(2);
    expect(envelope.error.code).toBe(code);
  });

  it('reports an unreachable server', async () => {
    const closedServer = await startTestServer(() => undefined);

    await closedServer.close();
    vi.stubEnv('TWENTY_API_URL', closedServer.url);

    const { envelope, exitCode } = await runJson([
      'api',
      'rest',
      '/rest/companies',
    ]);

    expect(exitCode).toBe(1);
    expect(envelope.error.code).toBe('NETWORK_ERROR');
  });
});
