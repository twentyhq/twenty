import { buildTestAppWorker } from '@/app/__tests__/utils/build-test-app-worker';
import { writeTestSourceSdk } from '@/app/__tests__/utils/write-test-source-sdk';
import { existsSync } from 'node:fs';
import { rm, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { type ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { readGraphqlRequest } from '@/__tests__/utils/read-graphql-request';
import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  afterAll,
  beforeAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { createStandardInputStub } from '@/__tests__/utils/create-standard-input-stub';
import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import {
  type RecordedRequest,
  sendJson,
  startTestServer,
} from '@/__tests__/utils/start-test-server';

const worker = vi.hoisted(() => ({ modulePath: '', execArgv: [] as string[] }));

vi.mock('@/app/get-app-worker-launch', () => ({
  getAppWorkerLaunch: () => worker,
}));

let workerDirectory: string;

beforeAll(async () => {
  workerDirectory = await mkdtemp(join(tmpdir(), 'twenty-command-worker-'));
  await buildTestAppWorker(workerDirectory, { useToolingFixture: true });
  worker.modulePath = join(workerDirectory, 'app-worker.cjs');
}, 60_000);

afterAll(() => rm(workerDirectory, { recursive: true, force: true }));

const APPLICATION = {
  universalIdentifier: '0f3a1c52-7d6e-4b8a-9c21-5e4d3b2a1f00',
  name: 'uninstall-app',
  displayName: 'Uninstall App',
};

type ServerState = {
  isInstalled: boolean;
  canBeUninstalled: boolean;
  uninstallError?: { code: string; subCode?: string };
  uninstallResult: unknown;
  isUninstallHeld: boolean;
  heldUninstallResponse?: ServerResponse;
};

const state: ServerState = {
  isInstalled: true,
  canBeUninstalled: true,
  uninstallResult: true,
  isUninstallHeld: false,
};

const graphqlError = ({
  code,
  subCode,
  field,
}: {
  code: string;
  subCode?: string;
  field?: string;
}) => ({
  data: null,
  errors: [
    {
      message: 'The server refused the request.',
      ...(isDefined(field) ? { path: [field] } : {}),
      extensions: { code, subCode },
    },
  ],
});

const getOperation = (request: RecordedRequest) => {
  const { query } = readGraphqlRequest(request);

  if (query.includes('findOneApplication')) {
    return 'check';
  }

  return query.includes('uninstallApplication') ? 'uninstall' : 'unknown';
};

const server = await startTestServer((request, response) => {
  const operation = getOperation(request);
  const { arguments: variables } = readGraphqlRequest(request);

  if (operation === 'check') {
    return sendJson(
      response,
      200,
      state.isInstalled
        ? {
            data: {
              findOneApplication: {
                name: APPLICATION.displayName,
                universalIdentifier: isString(variables.universalIdentifier)
                  ? variables.universalIdentifier.toLowerCase()
                  : null,
                canBeUninstalled: state.canBeUninstalled,
              },
            },
          }
        : graphqlError({
            code: 'NOT_FOUND',
            subCode: 'APPLICATION_NOT_FOUND',
          }),
    );
  }

  if (operation === 'uninstall') {
    if (isDefined(state.uninstallError)) {
      return sendJson(
        response,
        200,
        graphqlError({
          ...state.uninstallError,
          field: 'uninstallApplication',
        }),
      );
    }

    if (state.isUninstallHeld) {
      state.heldUninstallResponse = response;

      return;
    }

    return sendJson(response, 200, {
      data: { uninstallApplication: state.uninstallResult },
    });
  }

  return sendJson(response, 400, { errors: [{ message: 'Unexpected' }] });
});

describe('app uninstall', () => {
  let appPath: string;

  const run = (...args: string[]) =>
    runCliForTest(['app', 'uninstall', '--path', appPath, ...args]);
  const runJson = async (...args: string[]) => {
    const result = await run(...args, '--json');

    return { ...result, envelope: parseSingleJsonLine(result.stdout) };
  };
  const operations = () => server.requests.map(getOperation);

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-cli-uninstall-'));
    await writeFile(
      join(appPath, 'package.json'),
      JSON.stringify({
        name: 'uninstall-app',
        devDependencies: { 'twenty-sdk': '9.9.9' },
      }),
    );
    await writeTestSourceSdk({ appPath });
    await writeFile(
      join(appPath, 'test-tooling.cjs'),
      `
      const fs = require('node:fs');
      const path = require('node:path');
      exports.buildSourceSnapshot = async () => {
        fs.writeFileSync(path.join(__dirname, 'built.txt'), 'built');
        return {
          success: true,
          data: {
            buildId: 'build-id',
            contentHash: 'a'.repeat(64),
            application: ${JSON.stringify(APPLICATION)},
            manifestFormat: 'twenty-application',
            manifest: { application: ${JSON.stringify(APPLICATION)} },
            files: [],
          },
          diagnostics: [],
        };
      };
      exports.releaseSourceSnapshot = async ({ buildId }) => {
        fs.writeFileSync(path.join(__dirname, 'released.txt'), buildId);
        return { success: true, data: null, diagnostics: [] };
      };
    `,
    );
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', 'uninstall-test-key');
    vi.stubEnv('TWENTY_REMOTE', '');
    vi.stubEnv('CI', '');
    Object.assign(state, {
      isInstalled: true,
      canBeUninstalled: true,
      uninstallError: undefined,
      uninstallResult: true,
      isUninstallHeld: false,
      heldUninstallResponse: undefined,
    });
    server.requests.length = 0;
  });

  afterEach(() => {
    state.heldUninstallResponse?.end();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterAll(() => server.close());

  it('finds the app from its build, checks it, then uninstalls it', async () => {
    const { envelope, exitCode } = await runJson('--yes');

    expect(exitCode).toBe(0);
    expect(envelope.data).toEqual({
      application: {
        universalIdentifier: APPLICATION.universalIdentifier,
        name: APPLICATION.displayName,
      },
      uninstalled: true,
      completedPhases: ['build', 'check', 'uninstall'],
    });
    expect(operations()).toEqual(['check', 'uninstall']);
    expect(readGraphqlRequest(server.requests[1]).arguments).toEqual({
      universalIdentifier: APPLICATION.universalIdentifier,
    });
    expect(await readFile(join(appPath, 'released.txt'), 'utf8')).toBe(
      'build-id',
    );
  });

  it('uninstalls by universal identifier without building the project', async () => {
    const { envelope, exitCode } = await runJson(
      '--universal-identifier',
      APPLICATION.universalIdentifier,
      '--yes',
    );

    expect(exitCode).toBe(0);
    expect(envelope.data.completedPhases).toEqual(['check', 'uninstall']);
    expect(existsSync(join(appPath, 'built.txt'))).toBe(false);
  });

  it('sends the canonical form of an uppercase universal identifier', async () => {
    const { envelope, exitCode } = await runJson(
      '--universal-identifier',
      APPLICATION.universalIdentifier.toUpperCase(),
      '--yes',
    );

    expect(exitCode).toBe(0);
    expect(envelope.data.application.universalIdentifier).toBe(
      APPLICATION.universalIdentifier,
    );
    expect(
      server.requests.map(
        (request) => readGraphqlRequest(request).arguments.universalIdentifier,
      ),
    ).toEqual([
      APPLICATION.universalIdentifier,
      APPLICATION.universalIdentifier,
    ]);
  });

  it('rejects a universal identifier that is not a UUID', async () => {
    const { envelope, exitCode } = await runJson(
      '--universal-identifier',
      'not-a-uuid',
      '--yes',
    );

    expect(exitCode).toBe(2);
    expect(envelope.error.code).toBe('INVALID_INPUT');
    expect(server.requests).toHaveLength(0);
  });

  it('reports an app that is not installed without trying to uninstall it', async () => {
    state.isInstalled = false;

    const { envelope, exitCode } = await runJson('--yes');

    expect(exitCode).toBe(4);
    expect(envelope.error).toMatchObject({
      code: 'APP_NOT_INSTALLED',
      hint: 'Nothing was uninstalled. Check the target workspace and the universal identifier.',
      details: {
        phase: 'check',
        outcome: 'not-started',
        completedPhases: ['build'],
      },
    });
    expect(operations()).toEqual(['check']);
  });

  it('refuses an app the workspace does not allow to uninstall', async () => {
    state.canBeUninstalled = false;

    const { envelope, exitCode } = await runJson('--yes');

    expect(exitCode).toBe(6);
    expect(envelope.error).toMatchObject({
      code: 'APP_NOT_UNINSTALLABLE',
      details: { phase: 'check', outcome: 'not-started' },
    });
    expect(operations()).toEqual(['check']);
  });

  it('requires --yes in automation', async () => {
    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(2);
    expect(envelope.error).toMatchObject({
      code: 'CONFIRMATION_REQUIRED',
      hint: expect.stringContaining('--yes'),
      details: {
        phase: 'confirmation',
        outcome: 'not-started',
        completedPhases: ['build', 'check'],
      },
    });
    expect(operations()).toEqual(['check']);
  });

  it.each([
    ['y\n', 0, 'uninstall'],
    ['n\n', 2, 'check'],
  ])(
    'asks before uninstalling in an interactive terminal (answer %j)',
    async (answer, expectedExitCode, lastOperation) => {
      vi.spyOn(process, 'stdin', 'get').mockReturnValue(
        createStandardInputStub({ content: answer, isTerminal: true }),
      );

      const { exitCode, stderr } = await run();

      expect(exitCode).toBe(expectedExitCode);
      expect(stderr).toContain('permanently deleted');
      expect(operations().at(-1)).toBe(lastOperation);
    },
  );

  it.each([
    [
      'an internal error',
      { code: 'INTERNAL_SERVER_ERROR' },
      'GRAPHQL_ERROR',
      1,
      'unknown',
    ],
    ['a refusal', { code: 'FORBIDDEN' }, 'PERMISSION_DENIED', 3, 'not-started'],
    [
      'a missing app',
      { code: 'NOT_FOUND', subCode: 'APPLICATION_NOT_FOUND' },
      'APP_NOT_INSTALLED',
      4,
      'unknown',
    ],
  ])(
    'reports the uninstall outcome for %s',
    async (_description, uninstallError, code, exitCode, outcome) => {
      state.uninstallError = uninstallError;

      const result = await runJson('--yes');

      expect(result.exitCode).toBe(exitCode);
      expect(result.envelope.error).toMatchObject({
        code,
        details: {
          phase: 'uninstall',
          outcome,
          completedPhases: ['build', 'check'],
        },
      });
    },
  );

  it('keeps the partial-run hint when the app disappears during the uninstall', async () => {
    state.uninstallError = {
      code: 'NOT_FOUND',
      subCode: 'APPLICATION_NOT_FOUND',
    };

    const { envelope, exitCode } = await runJson('--yes');

    expect(exitCode).toBe(4);
    expect(envelope.error).toMatchObject({
      code: 'APP_NOT_INSTALLED',
      hint: expect.stringContaining('The uninstall may have partly run.'),
      details: { phase: 'uninstall', outcome: 'unknown' },
    });
  });

  it('does not report success when the server does not confirm the uninstall', async () => {
    state.uninstallResult = false;

    const { envelope, exitCode, stdout } = await runJson('--yes');

    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'INVALID_RESPONSE',
      details: { phase: 'uninstall', outcome: 'unknown' },
    });
    expect(stdout).not.toContain('"uninstalled":true');
  });

  it('exits with 130 and an unknown outcome when cancelled during the uninstall', async () => {
    state.isUninstallHeld = true;

    const pending = runJson('--yes');

    await vi.waitFor(() => expect(operations()).toContain('uninstall'), {
      timeout: 10_000,
    });
    process.emit('SIGINT');

    const { envelope, exitCode } = await pending;

    expect(exitCode).toBe(130);
    expect(envelope.error).toMatchObject({
      code: 'CANCELLED',
      details: { phase: 'uninstall', outcome: 'unknown' },
    });
  });

  it('names the app and says its registration is kept', async () => {
    const { stdout, exitCode } = await run('--yes');

    expect(exitCode).toBe(0);
    expect(stdout).toContain(`Uninstalled Uninstall App from ${server.url}`);
    expect(stdout).toContain('registration is kept');
  });

  it('lists the command as a write with its permission', async () => {
    const { stdout } = await runCliForTest(['commands', '--json']);
    const commands: unknown = parseSingleJsonLine(stdout).data.commands;

    expect(commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'app uninstall',
          writes: true,
          needsTarget: true,
          requiredPermissions: ['APPLICATIONS'],
        }),
      ]),
    );
  });
});
