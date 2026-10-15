import { type ServerResponse } from 'node:http';

import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { runCliForTest } from '@/__tests__/utils/run-cli-for-test';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';
import { readAppIdentity } from '@/app/read-app-identity';
import { resolveCommandTarget } from '@/program/resolve-command-target';
import { runCli } from '@/run-cli';

vi.mock('@/app/read-app-identity');
vi.mock('@/program/resolve-command-target');
vi.mock('@/app/project/resolve-app-project', () => ({
  resolveAppProject: async () => ({ path: '/test-app', name: 'test-app' }),
}));

const APPLICATION_IDENTIFIER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const FIRST_FUNCTION_IDENTIFIER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const SECOND_FUNCTION_IDENTIFIER = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const entry = (identifier = FIRST_FUNCTION_IDENTIFIER, logs = 'Hello\n') => ({
  data: {
    logicFunctionLogs: {
      logs,
      name: 'same-name',
      universalIdentifier: identifier,
    },
  },
});
const next = (data: unknown) =>
  `event: next\ndata: ${JSON.stringify(data)}\n\n`;
const complete = 'event: complete\n\n';
const open = (response: ServerResponse) => {
  response.writeHead(200, { 'content-type': 'text/event-stream' });
  response.write(': ping\n\n');
};
let handler: (body: string, response: ServerResponse) => void;
const server = await startTestServer((request, response) =>
  handler(request.body, response),
);
const run = (...options: string[]) =>
  runCliForTest(['app', 'logs', ...options]);
const runStream = async (...options: string[]) => {
  const result = await run(...options, '--format', 'ndjson');
  return {
    ...result,
    events: result.stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line)),
  };
};

beforeEach(() => {
  server.requests.length = 0;
  handler = (_body, response) => {
    open(response);
    response.end(
      next(entry()) +
        next(entry(SECOND_FUNCTION_IDENTIFIER, 'Second\n')) +
        complete,
    );
  };
  vi.mocked(readAppIdentity).mockResolvedValue({
    application: {
      universalIdentifier: APPLICATION_IDENTIFIER,
      displayName: 'Test app',
    },
    diagnostics: [],
  });
  vi.mocked(resolveCommandTarget).mockResolvedValue({
    apiUrl: server.url,
    bearerToken: 'private-api-key',
    credentialKind: 'apiKey',
    source: 'remote',
    remoteName: 'dev',
  });
});
afterEach(() => vi.clearAllMocks());
afterAll(async () => server.close());

describe('twenty app logs', () => {
  it('subscribes only to this app and labels every matching function, including duplicate names', async () => {
    const result = await runStream();
    expect(result.exitCode).toBe(0);
    expect(server.requests).toHaveLength(1);
    expect(server.requests[0]).toMatchObject({
      method: 'POST',
      path: '/metadata',
      headers: {
        authorization: 'Bearer private-api-key',
        accept: 'text/event-stream',
      },
    });
    expect(JSON.parse(server.requests[0].body).variables).toEqual({
      input: { applicationUniversalIdentifier: APPLICATION_IDENTIFIER },
    });
    expect(result.events.map(({ type }) => type)).toEqual([
      'start',
      'progress',
      'record',
      'record',
      'result',
    ]);
    expect(
      result.events
        .filter(({ type }) => type === 'record')
        .map(({ data }) => data.functionUniversalIdentifier),
    ).toEqual([FIRST_FUNCTION_IDENTIFIER, SECOND_FUNCTION_IDENTIFIER]);
    expect(result.events.at(-1).data.recordCount).toBe(2);
    expect(result.stdout).not.toContain('private-api-key');
  });

  it('treats an exact name as a filter that can match several functions', async () => {
    const result = await runStream('--name', 'same-name');
    expect(result.events.filter(({ type }) => type === 'record')).toHaveLength(
      2,
    );
    expect(JSON.parse(server.requests[0].body).variables.input).toEqual({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'same-name',
    });
  });

  it.each([4, 5, 6, 7, 8])(
    'subscribes with a canonical UUIDv%s universal identifier filter',
    async (version) => {
      const universalIdentifier = `bbbbbbbb-bbbb-${version}bbb-8bbb-bbbbbbbbbbbb`;
      handler = (_body, response) => {
        open(response);
        response.end(next(entry(universalIdentifier)) + complete);
      };

      const result = await runStream(
        '--universal-identifier',
        universalIdentifier.toUpperCase(),
      );

      expect(result.exitCode).toBe(0);
      expect(server.requests).toHaveLength(1);
      expect(JSON.parse(server.requests[0].body).variables.input).toEqual({
        applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
        universalIdentifier,
      });
      expect(
        result.events
          .filter(({ type }) => type === 'record')
          .map(({ data }) => data.functionUniversalIdentifier),
      ).toEqual([universalIdentifier]);
    },
  );

  it.each([
    ['--name', ''],
    ['--universal-identifier', 'invalid'],
    ['--universal-identifier', 'bbbbbbbb-bbbb-1bbb-8bbb-bbbbbbbbbbbb'],
    ['--universal-identifier', 'bbbbbbbb-bbbb-2bbb-8bbb-bbbbbbbbbbbb'],
    ['--universal-identifier', 'bbbbbbbb-bbbb-3bbb-8bbb-bbbbbbbbbbbb'],
    ['--name', 'test', '--universal-identifier', FIRST_FUNCTION_IDENTIFIER],
  ])('rejects invalid filters before loading source', async (...options) => {
    const result = await runStream(...options);
    expect(result.exitCode).toBe(2);
    expect(readAppIdentity).not.toHaveBeenCalled();
    expect(server.requests).toEqual([]);
  });

  it('rejects finite JSON before target resolution', async () => {
    const result = await run('--json');
    expect(result.exitCode).toBe(2);
    expect(resolveCommandTarget).not.toHaveBeenCalled();
  });

  it('requires an application definition', async () => {
    vi.mocked(readAppIdentity).mockResolvedValue({
      application: null,
      diagnostics: [],
    });
    const result = await runStream();
    expect(result.exitCode).toBe(2);
    expect(server.requests).toEqual([]);
  });

  it('prints escaped human logs with function identities', async () => {
    handler = (_body, response) => {
      open(response);
      response.end(
        next(entry(FIRST_FUNCTION_IDENTIFIER, 'Hello\n\u001b[2J')) + complete,
      );
    };
    const result = await run();
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      `[same-name · ${FIRST_FUNCTION_IDENTIFIER}]`,
    );
    expect(result.stdout).toContain('Hello');
    expect(result.stdout).not.toContain('\u001b');
    expect(result.stdout).toContain('\\u001b');
  });

  it('colors the function name and dims its identifier in a color terminal', async () => {
    vi.stubEnv('FORCE_COLOR', '1');
    try {
      const result = await run();
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        `[\u001b[36msame-name\u001b[39m · \u001b[2m${FIRST_FUNCTION_IDENTIFIER}\u001b[22m]`,
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('prints the SDK Node warning before watching starts in human output', async () => {
    const message =
      'twenty-sdk 2.45.0 declares Node ^22.0.0; continuing on Node 26.0.0, which is outside that range.';

    vi.mocked(readAppIdentity).mockImplementation(async ({ warn }) => {
      warn?.({ code: 'NODE_VERSION_UNTESTED', message });

      return {
        application: {
          universalIdentifier: APPLICATION_IDENTIFIER,
          displayName: 'Test app',
        },
        diagnostics: [],
      };
    });

    const result = await run();
    const warningIndex = result.stderr.indexOf(message);

    expect(result.exitCode).toBe(0);
    expect(warningIndex).toBeGreaterThanOrEqual(0);
    expect(warningIndex).toBeLessThan(result.stderr.indexOf('Watching'));
    expect(result.stderr.lastIndexOf(message)).toBe(warningIndex);
  });

  it.each(['http', 'sse', 'sse-without-code'])(
    'falls back once for missing identity fields over %s, with an explicit warning',
    async (transport) => {
      handler = (body, response) => {
        if (JSON.parse(body).query.includes('name universalIdentifier')) {
          const payload = {
            errors: [
              {
                message:
                  'Cannot query field "name" on type "LogicFunctionLogs".',
                ...(transport === 'sse-without-code'
                  ? {}
                  : { extensions: { code: 'GRAPHQL_VALIDATION_FAILED' } }),
              },
            ],
          };
          if (transport === 'http') {
            sendJson(response, 400, payload);
          } else {
            open(response);
            response.end(next(payload) + complete);
          }
        } else {
          open(response);
          response.end(
            next({ data: { logicFunctionLogs: { logs: 'Legacy\n' } } }) +
              complete,
          );
        }
      };
      const result = await runStream();
      expect(result.exitCode).toBe(0);
      expect(server.requests).toHaveLength(2);
      expect(
        result.events.find(({ type }) => type === 'warning').data.code,
      ).toBe('LOG_IDENTITY_UNAVAILABLE');
      expect(
        result.events.find(({ type }) => type === 'record').data,
      ).toMatchObject({
        functionName: null,
        functionUniversalIdentifier: null,
        logs: 'Legacy\n',
      });
    },
  );

  it('does not fall back on unrelated validation errors', async () => {
    handler = (_body, response) => {
      open(response);
      response.end(
        next({
          errors: [
            {
              message: 'Cannot query field "name" on type "LogicFunctionLogs".',
            },
            {
              message:
                'Unknown argument "input" on field "Subscription.logicFunctionLogs".',
            },
          ],
        }) + complete,
      );
    };
    const result = await runStream();
    expect(result.exitCode).toBe(1);
    expect(server.requests).toHaveLength(1);
    expect(result.events.some(({ type }) => type === 'warning')).toBe(false);
  });

  it.each([
    ['--name', 'same-name', 'functionName'],
    [
      '--universal-identifier',
      FIRST_FUNCTION_IDENTIFIER,
      'functionUniversalIdentifier',
    ],
  ])(
    'retains the explicit %s filter identity with an older server',
    async (option, value, field) => {
      handler = (body, response) => {
        open(response);
        response.end(
          next(
            JSON.parse(body).query.includes('name universalIdentifier')
              ? {
                  errors: [
                    {
                      message:
                        'Cannot query field "name" on type "LogicFunctionLogs".',
                    },
                  ],
                }
              : { data: { logicFunctionLogs: { logs: 'Legacy' } } },
          ) + complete,
        );
      };
      const result = await runStream(option, value);
      expect(result.exitCode).toBe(0);
      expect(
        result.events.find(({ type }) => type === 'record').data[field],
      ).toBe(value);
      expect(server.requests).toHaveLength(2);
    },
  );

  it.each(['FORBIDDEN', 'UNAUTHENTICATED', 'INTERNAL_SERVER_ERROR'])(
    'does not retry or fall back on %s',
    async (code) => {
      handler = (_body, response) => {
        open(response);
        response.end(
          next({ errors: [{ message: 'Rejected', extensions: { code } }] }) +
            complete,
        );
      };
      const result = await runStream();
      expect(result.exitCode).toBe(code === 'INTERNAL_SERVER_ERROR' ? 1 : 3);
      expect(server.requests).toHaveLength(1);
      expect(result.events.at(-1).type).toBe('error');
    },
  );

  it('never falls back after emitting a log record', async () => {
    handler = (_body, response) => {
      open(response);
      response.end(
        next(entry()) +
          next({
            errors: [
              {
                message:
                  'Cannot query field "name" on type "LogicFunctionLogs".',
                extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
              },
            ],
          }),
      );
    };
    const result = await runStream();
    expect(result.exitCode).toBe(1);
    expect(server.requests).toHaveLength(1);
    expect(result.events.at(-1).data.details.recordCount).toBe(1);
  });

  it.each([
    'broken-json',
    'broken-record',
    'unexpected-event',
    'eof',
    'disconnect',
  ])(
    'reports %s with no reconnect and preserves prior records',
    async (failure) => {
      handler = (_body, response) => {
        open(response);
        response.write(next(entry()));
        if (failure === 'disconnect') {
          setTimeout(() => response.destroy(), 20);
          return;
        }
        const last =
          failure === 'broken-json'
            ? 'event: next\ndata: not-json\n\n'
            : failure === 'broken-record'
              ? next({ data: { logicFunctionLogs: null } })
              : failure === 'unexpected-event'
                ? 'event: unknown\ndata: {}\n\n'
                : '';
        response.end(last);
      };
      const result = await runStream();
      expect(result.exitCode).toBe(1);
      expect(server.requests).toHaveLength(1);
      expect(result.events.at(-1).type).toBe('error');
      expect(result.events.at(-1).data.details.recordCount).toBe(1);
      if (failure === 'disconnect' || failure === 'eof') {
        expect(result.events.at(-1).data.hint).toContain('cannot be replayed');
      }
    },
  );

  it.each(['human', 'ndjson'])(
    'waits for %s output to drain before writing the next record',
    async (mode) => {
      const firstRecord = Promise.withResolvers<void>();
      const records: string[] = [];
      const stdout = vi
        .spyOn(process.stdout, 'write')
        .mockImplementation((chunk) => {
          const text = String(chunk);
          if (
            mode === 'ndjson'
              ? text.includes('"type":"record"')
              : text.startsWith('[same-name')
          ) {
            records.push(text);
            if (records.length === 1) {
              firstRecord.resolve();
              return false;
            }
          }
          return true;
        });
      const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
      const previousExitCode = process.exitCode;
      const running = runCli(['app', 'logs', '--format', mode]);
      try {
        await firstRecord.promise;
        await new Promise((resolve) => setImmediate(resolve));
        expect(records).toHaveLength(1);
        process.stdout.emit('drain');
        await running;
        expect(records).toHaveLength(2);
      } finally {
        process.stdout.emit('drain');
        await running;
        stdout.mockRestore();
        stderr.mockRestore();
        process.exitCode = previousExitCode;
      }
    },
  );

  it.each([401, 403, 503])(
    'preserves HTTP %s failures without a retry',
    async (status) => {
      handler = (_body, response) =>
        sendJson(response, status, { message: 'Unavailable' });
      const result = await runStream();
      expect(result.exitCode).toBe(status === 503 ? 1 : 3);
      expect(server.requests).toHaveLength(1);
    },
  );

  it('does not follow redirects or forward credentials elsewhere', async () => {
    handler = (_body, response) => {
      response.writeHead(307, {
        location: 'https://elsewhere.invalid/metadata',
      });
      response.end();
    };
    const result = await runStream();
    expect(result.events.at(-1).data.code).toBe('REDIRECT_NOT_FOLLOWED');
    expect(server.requests).toHaveLength(1);
  });

  it('cancels an idle subscription with exit 130 and closes its connection', async () => {
    let closed = false;
    handler = (_body, response) => {
      open(response);
      response.on('close', () => {
        closed = true;
      });
      setTimeout(() => process.emit('SIGINT'), 20);
    };
    const result = await runStream();
    expect(result.exitCode).toBe(130);
    expect(result.events.at(-1).data.code).toBe('CANCELLED');
    await vi.waitFor(() => expect(closed).toBe(true));
    expect(server.requests).toHaveLength(1);
  });
});
