import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  afterAll,
  afterEach,
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
import { runAppWorker } from '@/app/run-app-worker';
import { resolveCommandTarget } from '@/program/resolve-command-target';

vi.mock('@/app/run-app-worker');
vi.mock('@/program/resolve-command-target');
vi.mock('@/app/project/resolve-app-project', () => ({
  resolveAppProject: async () => ({ path: '/test-app', name: 'test-app' }),
}));
vi.mock('@/app/project/resolve-source-sdk', () => ({
  resolveSourceSdk: async () => ({
    version: '2.44.0',
    packagePath: '/test-app/node_modules/twenty-sdk',
  }),
}));

const APPLICATION_IDENTIFIER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const FUNCTION_IDENTIFIER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const OTHER_FUNCTION_IDENTIFIER = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const APPLICATION = {
  id: 'application-id',
  universalIdentifier: APPLICATION_IDENTIFIER,
};
const FUNCTION = {
  id: 'function-id',
  name: 'helloWorld',
  universalIdentifier: FUNCTION_IDENTIFIER,
  applicationId: APPLICATION.id,
  timeoutSeconds: 300,
};
const EXECUTION = {
  status: 'SUCCESS',
  duration: 12,
  data: { greeting: 'Hello' },
  logs: 'Hello from the function\n',
  error: null,
};
let queryResult: unknown;
let executionResult: unknown;
let executionStatus = 200;
let disconnect = false;
let interrupt = false;

const server = await startTestServer((request, response) => {
  const { query } = JSON.parse(request.body);
  if (query.includes('executeOneLogicFunction')) {
    if (disconnect) {
      return response.destroy();
    }
    if (interrupt) {
      process.emit('SIGINT');
      return;
    }
    sendJson(response, executionStatus, executionResult);
  } else {
    sendJson(response, 200, queryResult);
  }
});

const run = (...options: string[]) =>
  runCliForTest(['app', 'exec', ...options]);
const runJson = async (...options: string[]) => {
  const result = await run(...options, '--json');
  return { ...result, envelope: parseSingleJsonLine(result.stdout) };
};
const mutations = () =>
  server.requests.filter(({ body }) =>
    body.includes('executeOneLogicFunction'),
  );
const setManifest = (
  application: Record<string, unknown> = {},
  functionIdentifier = FUNCTION_IDENTIFIER,
) => {
  vi.mocked(runAppWorker).mockResolvedValue({
    result: {
      success: true,
      data: {
        manifest: {
          application: {
            universalIdentifier: APPLICATION_IDENTIFIER,
            ...application,
          },
          logicFunctions: [{ universalIdentifier: functionIdentifier }],
        },
      },
      diagnostics: [],
    },
    isSnapshotHeld: false,
    output: { stdout: '', stderr: '', isTruncated: false },
  });
};

beforeEach(() => {
  server.requests.length = 0;
  disconnect = false;
  interrupt = false;
  executionStatus = 200;
  queryResult = {
    data: {
      findOneApplication: APPLICATION,
      findManyLogicFunctions: [FUNCTION],
    },
  };
  executionResult = { data: { executeOneLogicFunction: EXECUTION } };
  vi.mocked(resolveCommandTarget).mockResolvedValue({
    apiUrl: server.url,
    bearerToken: 'user-token',
    credentialKind: 'oauth',
    source: 'remote',
    remoteName: 'dev',
  });
  setManifest();
});
afterEach(() => vi.clearAllMocks());
afterAll(async () => server.close());

describe('twenty app exec', () => {
  it.each([
    [],
    ['--name', 'helloWorld', '--pre-install'],
    ['--post-install', '--uninstall-hook'],
    ['--name', ''],
    ['--universal-identifier', 'invalid'],
    ['--universal-identifier', 'bbbbbbbb-bbbb-1bbb-8bbb-bbbbbbbbbbbb'],
    ['--universal-identifier', 'bbbbbbbb-bbbb-2bbb-8bbb-bbbbbbbbbbbb'],
    ['--universal-identifier', 'bbbbbbbb-bbbb-3bbb-8bbb-bbbbbbbbbbbb'],
  ])(
    'rejects invalid selectors %j before loading project source or sending requests',
    async (...options) => {
      const result = await runJson(...options);
      expect(result.exitCode).toBe(2);
      expect(result.envelope.error.code).toBe('INVALID_INPUT');
      expect(runAppWorker).not.toHaveBeenCalled();
      expect(server.requests).toEqual([]);
    },
  );

  it('rejects an API-key target before loading source, with browser-login guidance', async () => {
    vi.mocked(resolveCommandTarget).mockResolvedValue({
      apiUrl: server.url,
      bearerToken: 'api-key',
      credentialKind: 'apiKey',
      source: 'environment',
    });
    const result = await runJson('--name', 'helloWorld');
    expect(result.exitCode).toBe(3);
    expect(result.envelope.error).toMatchObject({
      code: 'AUTH_REQUIRED',
      hint: expect.stringContaining('twenty auth login'),
    });
    expect(runAppWorker).not.toHaveBeenCalled();
    expect(server.requests).toEqual([]);
  });

  it.each(['not json', '[]', 'null', '42'])(
    'rejects a non-object payload %s before reading source',
    async (payload) => {
      const result = await runJson(
        '--name',
        'helloWorld',
        '--payload',
        payload,
      );
      expect(result.exitCode).toBe(2);
      expect(runAppWorker).not.toHaveBeenCalled();
      expect(server.requests).toEqual([]);
    },
  );

  it('executes the deployed app function once with the given payload and returns its result', async () => {
    const result = await runJson(
      '--name',
      'helloWorld',
      '--payload',
      '{"name":"Ada"}',
    );
    expect(result.exitCode).toBe(0);
    expect(result.envelope).toMatchObject({
      ok: true,
      command: 'app exec',
      data: {
        applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
        functionName: 'helloWorld',
        functionUniversalIdentifier: FUNCTION_IDENTIFIER,
        status: 'SUCCESS',
        durationMilliseconds: 12,
        data: { greeting: 'Hello' },
        logs: EXECUTION.logs,
        error: null,
      },
    });
    expect(runAppWorker).toHaveBeenCalledWith(
      expect.objectContaining({
        request: { type: 'buildManifest', appPath: '/test-app' },
      }),
    );
    expect(mutations()).toHaveLength(1);
    expect(JSON.parse(mutations()[0].body).variables).toEqual({
      v1: { id: FUNCTION.id, payload: { name: 'Ada' } },
    });
    expect(
      server.requests.every(
        ({ headers }) => headers.authorization === 'Bearer user-token',
      ),
    ).toBe(true);
    expect(result.stdout).not.toContain('user-token');
  });

  it.each([
    ['--universal-identifier', FUNCTION_IDENTIFIER.toUpperCase(), undefined],
    ['--post-install', undefined, 'postInstallLogicFunction'],
    ['--pre-install', undefined, 'preInstallLogicFunction'],
    ['--uninstall-hook', undefined, 'uninstallLogicFunction'],
  ])(
    'supports selector %s without installing or uninstalling the app',
    async (flag, value, hook) => {
      if (hook) {
        setManifest({ [hook]: { universalIdentifier: FUNCTION_IDENTIFIER } });
      }
      const result = await runJson(flag, ...(value ? [value] : []));
      expect(result.exitCode).toBe(0);
      expect(mutations()).toHaveLength(1);
      expect(server.requests).toHaveLength(2);
    },
  );

  it.each([4, 5, 6, 7, 8])(
    'executes a function selected by its UUIDv%s universal identifier',
    async (version) => {
      const universalIdentifier = `bbbbbbbb-bbbb-${version}bbb-8bbb-bbbbbbbbbbbb`;
      setManifest({}, universalIdentifier);
      queryResult = {
        data: {
          findOneApplication: APPLICATION,
          findManyLogicFunctions: [{ ...FUNCTION, universalIdentifier }],
        },
      };

      const result = await runJson(
        '--universal-identifier',
        universalIdentifier.toUpperCase(),
      );

      expect(result.exitCode).toBe(0);
      expect(result.envelope.data.functionUniversalIdentifier).toBe(
        universalIdentifier,
      );
      expect(mutations()).toHaveLength(1);
      expect(JSON.parse(mutations()[0].body).variables).toEqual({
        v1: { id: FUNCTION.id, payload: {} },
      });
    },
  );

  it('reads payload from an explicit file', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'twenty-exec-payload-'));
    try {
      const file = join(directory, 'payload.json');
      await writeFile(file, '{"name":"Grace"}');
      const result = await runJson(
        '--name',
        'helloWorld',
        '--payload',
        `@${file}`,
      );
      expect(result.exitCode).toBe(0);
      expect(JSON.parse(mutations()[0].body).variables).toEqual({
        v1: { id: FUNCTION.id, payload: { name: 'Grace' } },
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('does not execute a function owned by another installed app, even if the local identifier matches', async () => {
    queryResult = {
      data: {
        findOneApplication: APPLICATION,
        findManyLogicFunctions: [{ ...FUNCTION, applicationId: 'another-app' }],
      },
    };
    const result = await runJson('--name', 'helloWorld');
    expect(result.exitCode).toBe(4);
    expect(result.envelope.error.code).toBe('NOT_FOUND');
    expect(mutations()).toEqual([]);
  });

  it('does not execute a function absent from the local manifest', async () => {
    queryResult = {
      data: {
        findOneApplication: APPLICATION,
        findManyLogicFunctions: [
          { ...FUNCTION, universalIdentifier: OTHER_FUNCTION_IDENTIFIER },
        ],
      },
    };
    const result = await runJson('--name', 'helloWorld');
    expect(result.exitCode).toBe(4);
    expect(mutations()).toEqual([]);
  });

  it('reports a missing hook without executing another function', async () => {
    const result = await runJson('--post-install');
    expect(result.exitCode).toBe(4);
    expect(result.envelope.error.details.availableFunctions).toEqual([
      { name: FUNCTION.name, universalIdentifier: FUNCTION_IDENTIFIER },
    ]);
    expect(mutations()).toEqual([]);
  });

  it('fails ambiguous selection rather than choosing the first function', async () => {
    queryResult = {
      data: {
        findOneApplication: APPLICATION,
        findManyLogicFunctions: [FUNCTION, { ...FUNCTION, id: 'duplicate-id' }],
      },
    };
    const result = await runJson('--name', 'helloWorld');
    expect(result.exitCode).toBe(6);
    expect(result.envelope.error.code).toBe('AMBIGUOUS_RESOURCE');
    expect(mutations()).toEqual([]);
  });

  it('reports manifest diagnostics and does not execute when source loading fails', async () => {
    vi.mocked(runAppWorker).mockResolvedValue({
      result: {
        success: false,
        error: { code: 'MANIFEST_BUILD_FAILED', message: 'Broken definition' },
        diagnostics: [],
      },
      isSnapshotHeld: false,
      output: { stdout: '', stderr: '', isTruncated: false },
    });
    const result = await runJson('--name', 'helloWorld');
    expect(result.exitCode).toBe(1);
    expect(result.envelope.error.code).toBe('BUILD_FAILED');
    expect(server.requests).toEqual([]);
  });

  it('returns nonzero with logs and structured function errors for a completed failure', async () => {
    executionResult = {
      data: {
        executeOneLogicFunction: {
          ...EXECUTION,
          status: 'ERROR',
          error: {
            errorType: 'Error',
            errorMessage: 'Oops',
            stackTrace: 'stack',
          },
        },
      },
    };
    const result = await runJson('--name', 'helloWorld');
    expect(result.exitCode).toBe(1);
    expect(result.envelope).toMatchObject({
      ok: false,
      error: {
        code: 'EXECUTION_FAILED',
        details: {
          outcome: 'completed',
          status: 'ERROR',
          durationMilliseconds: 12,
          logs: EXECUTION.logs,
          error: { errorMessage: 'Oops' },
        },
      },
    });
    expect(mutations()).toHaveLength(1);
  });

  it('shows returned error details and logs in human mode', async () => {
    executionResult = {
      data: {
        executeOneLogicFunction: {
          ...EXECUTION,
          status: 'ERROR',
          error: { errorMessage: 'Oops' },
        },
      },
    };
    const result = await run('--name', 'helloWorld');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Status: ERROR');
    expect(result.stderr).toContain('Oops');
    expect(result.stderr).toContain('Hello from the function');
  });

  it('preserves permission errors without retrying execution', async () => {
    executionResult = {
      errors: [
        {
          message: 'This endpoint requires a token bound to a user.',
          extensions: { code: 'FORBIDDEN' },
        },
      ],
    };
    const result = await runJson('--name', 'helloWorld');
    expect(result.exitCode).toBe(3);
    expect(result.envelope.error).toMatchObject({
      code: 'PERMISSION_DENIED',
      details: { outcome: 'not-started' },
    });
    expect(mutations()).toHaveLength(1);
  });

  it.each(['NOT_FOUND', 'BAD_USER_INPUT', 'GRAPHQL_VALIDATION_FAILED'])(
    'reports a rejected request for %s without claiming execution started',
    async (code) => {
      executionResult = {
        errors: [{ message: 'Execution rejected', extensions: { code } }],
      };
      const result = await runJson('--name', 'helloWorld');
      expect(result.exitCode).toBe(1);
      expect(result.envelope.error.details.outcome).toBe('not-started');
      expect(mutations()).toHaveLength(1);
    },
  );

  it('keeps an unknown outcome for server internal errors', async () => {
    executionResult = {
      errors: [
        {
          message: 'Internal error',
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        },
      ],
    };
    const result = await runJson('--name', 'helloWorld');
    expect(result.envelope.error.details.outcome).toBe('unknown');
    expect(mutations()).toHaveLength(1);
  });

  it('reports an uninstalled app without attempting execution', async () => {
    queryResult = {
      errors: [
        {
          message: 'Application not found',
          path: ['findOneApplication'],
          extensions: { code: 'NOT_FOUND', subCode: 'APPLICATION_NOT_FOUND' },
        },
      ],
    };
    const result = await runJson('--name', 'helloWorld');
    expect(result.exitCode).toBe(4);
    expect(result.envelope.error.code).toBe('APP_NOT_INSTALLED');
    expect(mutations()).toEqual([]);
  });

  it('rejects a mismatched application identity before execution', async () => {
    queryResult = {
      data: {
        findOneApplication: {
          ...APPLICATION,
          universalIdentifier: OTHER_FUNCTION_IDENTIFIER,
        },
        findManyLogicFunctions: [FUNCTION],
      },
    };
    const result = await runJson('--name', 'helloWorld');
    expect(result.envelope.error.code).toBe('INVALID_RESPONSE');
    expect(mutations()).toEqual([]);
  });

  it.each(['disconnect', 'http-error', 'invalid-response', 'interrupt'])(
    'reports an uncertain outcome after %s without replaying',
    async (mode) => {
      disconnect = mode === 'disconnect';
      interrupt = mode === 'interrupt';
      if (mode === 'http-error') {
        executionStatus = 503;
      }
      if (mode === 'invalid-response') {
        executionResult = { data: { executeOneLogicFunction: null } };
      }
      const result = await runJson('--name', 'helloWorld');
      expect(result.exitCode).toBe(mode === 'interrupt' ? 130 : 1);
      expect(result.envelope.error.details.outcome).toBe('unknown');
      expect(result.envelope.error.hint).toContain('before retrying');
      expect(mutations()).toHaveLength(1);
    },
  );

  it('rejects streaming output before resolving the target', async () => {
    const result = await run('--name', 'helloWorld', '--format', 'ndjson');
    expect(result.exitCode).toBe(2);
    expect(resolveCommandTarget).not.toHaveBeenCalled();
  });
});
