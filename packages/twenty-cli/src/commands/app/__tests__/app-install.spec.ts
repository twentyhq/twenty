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

import { readGraphqlRequest } from '@/__tests__/utils/read-graphql-request';
import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';

const build = vi.hoisted(() => vi.fn());
const timing = vi.hoisted(() => ({
  POLL_INTERVAL_MILLISECONDS: 1,
  TIMEOUT_MILLISECONDS: 5_000,
}));
vi.mock('@/app/run-app-operation', () => ({ runAppBuild: build }));
vi.mock('@/app/deployment/constants/app-install.constant', () => ({
  APP_INSTALL: timing,
}));

const UNIVERSAL_IDENTIFIER = '0f3a1c52-7d6e-4b8a-9c21-5e4d3b2a1f00';
const JOB_ID = 'installation-job-1';
const application = {
  name: 'Billing App',
  universalIdentifier: UNIVERSAL_IDENTIFIER,
  canBeUninstalled: true,
};
const state = {
  startResult: { jobId: JOB_ID } as unknown,
  startError: undefined as string | undefined,
  statuses: [] as unknown[],
  installedApplication: application as unknown,
  holdStart: false,
  heldResponse: undefined as ServerResponse | undefined,
};
const server = await startTestServer((request, response) => {
  const { query } = readGraphqlRequest(request);

  if (query.includes('triggerInstallApplication')) {
    if (state.holdStart) {
      state.heldResponse = response;
      return;
    }
    if (state.startError) {
      return sendJson(response, 200, {
        data: null,
        errors: [
          {
            message: 'Install refused',
            path: ['triggerInstallApplication'],
            extensions: { code: state.startError },
          },
        ],
      });
    }
    return sendJson(response, 200, {
      data: { triggerInstallApplication: state.startResult },
    });
  }
  if (query.includes('findInstallApplicationJobStatus')) {
    const status =
      state.statuses.length > 1 ? state.statuses.shift() : state.statuses[0];
    return sendJson(response, 200, {
      data: { findInstallApplicationJobStatus: status },
    });
  }
  if (query.includes('findOneApplication')) {
    return sendJson(response, 200, {
      data: { findOneApplication: state.installedApplication },
    });
  }
  return sendJson(response, 400, {
    errors: [{ message: 'Unexpected request' }],
  });
});

const jobStatus = (status: string) => ({
  jobId: JOB_ID,
  state: status,
  failedReason: null,
});
const operationNames = () =>
  server.requests.map((request) => readGraphqlRequest(request).query);
const run = (...args: string[]) => runCliForTest(['app', 'install', ...args]);
const runJson = async (...args: string[]) => {
  const result = await run(...args, '--json');
  return { ...result, envelope: parseSingleJsonLine(result.stdout) };
};
const installByIdentifier = (...args: string[]) =>
  runJson('--universal-identifier', UNIVERSAL_IDENTIFIER, ...args);

describe('app install', () => {
  beforeEach(() => {
    build.mockReset().mockResolvedValue({
      data: { application: { universalIdentifier: UNIVERSAL_IDENTIFIER } },
    });
    timing.TIMEOUT_MILLISECONDS = 5_000;
    Object.assign(state, {
      startResult: { jobId: JOB_ID },
      startError: undefined,
      statuses: [jobStatus('COMPLETED')],
      installedApplication: application,
      holdStart: false,
      heldResponse: undefined,
    });
    server.requests.length = 0;
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', 'install-test-key');
    vi.stubEnv('TWENTY_REMOTE', '');
  });

  afterEach(() => {
    state.heldResponse?.end();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });
  afterAll(() => server.close());

  it('waits for its queued job and verifies the installation without building', async () => {
    state.statuses = [
      jobStatus('WAITING'),
      jobStatus('ACTIVE'),
      jobStatus('COMPLETED'),
    ];
    const { envelope, exitCode } = await installByIdentifier();

    expect(exitCode).toBe(0);
    expect(envelope.data).toEqual({
      application: {
        name: 'Billing App',
        universalIdentifier: UNIVERSAL_IDENTIFIER,
      },
      installed: true,
      jobId: JOB_ID,
    });
    expect(build).not.toHaveBeenCalled();
    expect(server.requests).toHaveLength(5);
    expect(readGraphqlRequest(server.requests[0]).arguments).toEqual({
      input: { universalIdentifier: UNIVERSAL_IDENTIFIER },
    });
    for (const request of server.requests.slice(1, 4)) {
      expect(readGraphqlRequest(request).arguments).toEqual({
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        jobId: JOB_ID,
      });
    }
    expect(operationNames().at(-1)).toContain('findOneApplication');
    expect(
      server.requests.every(
        (request) =>
          request.headers.authorization === 'Bearer install-test-key',
      ),
    ).toBe(true);
  });

  it('uses the local build identifier without uploading or syncing source', async () => {
    const { exitCode } = await runJson('--path', '/app/source');
    expect(exitCode).toBe(0);
    expect(build).toHaveBeenCalledWith({
      context: expect.objectContaining({
        options: expect.objectContaining({ path: '/app/source' }),
      }),
    });
    expect(server.requests).toHaveLength(3);
    expect(readGraphqlRequest(server.requests[0]).arguments).toEqual({
      input: { universalIdentifier: UNIVERSAL_IDENTIFIER },
    });
  });

  it('does not start an install if the build fails', async () => {
    build.mockRejectedValue(new Error('Broken app source'));
    expect((await runJson()).exitCode).toBe(1);
    expect(server.requests).toHaveLength(0);
  });

  it('canonicalizes uppercase universal identifiers', async () => {
    const { exitCode } = await runJson(
      '--universal-identifier',
      UNIVERSAL_IDENTIFIER.toUpperCase(),
    );
    expect(exitCode).toBe(0);
    expect(readGraphqlRequest(server.requests[0]).arguments).toEqual({
      input: { universalIdentifier: UNIVERSAL_IDENTIFIER },
    });
  });

  it('rejects invalid identifiers before building or requesting an install', async () => {
    const { envelope, exitCode } = await runJson(
      '--universal-identifier',
      'wrong',
    );
    expect(exitCode).toBe(2);
    expect(envelope.error.code).toBe('INVALID_INPUT');
    expect(build).not.toHaveBeenCalled();
    expect(server.requests).toHaveLength(0);
  });

  it.each([null, {}, { jobId: '' }])(
    'rejects a missing job identifier (%j)',
    async (startResult) => {
      state.startResult = startResult;
      const { envelope, exitCode } = await installByIdentifier();
      expect(exitCode).toBe(1);
      expect(envelope.error).toMatchObject({
        code: 'INVALID_RESPONSE',
        details: { phase: 'start', outcome: 'unknown' },
      });
      expect(server.requests).toHaveLength(1);
    },
  );

  it.each([
    null,
    { jobId: 'another-job', state: 'COMPLETED' },
    { jobId: JOB_ID, state: 'UNKNOWN' },
  ])(
    'never treats missing or unrelated job status as success (%j)',
    async (status) => {
      state.statuses = [status];
      const { envelope, exitCode } = await installByIdentifier();
      expect(exitCode).toBe(1);
      expect(envelope.error).toMatchObject({
        code: 'INVALID_RESPONSE',
        details: { phase: 'wait', outcome: 'unknown', jobId: JOB_ID },
      });
      expect(
        operationNames().some((query) => query.includes('findOneApplication')),
      ).toBe(false);
    },
  );

  it('reports job failures even if an earlier installation still exists', async () => {
    state.statuses = [
      { ...jobStatus('FAILED'), failedReason: 'Post-install hook failed' },
    ];
    const { envelope, exitCode } = await installByIdentifier();
    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'INSTALL_FAILED',
      message: 'Post-install hook failed',
      details: { phase: 'wait', outcome: 'failed', jobId: JOB_ID },
    });
    expect(envelope.error.hint).toContain('partly run');
    expect(
      operationNames().some((query) => query.includes('findOneApplication')),
    ).toBe(false);
  });

  it('verifies the installed app identity after completion', async () => {
    state.installedApplication = {
      ...application,
      universalIdentifier: '1f3a1c52-7d6e-4b8a-9c21-5e4d3b2a1f00',
    };
    const { envelope, exitCode } = await installByIdentifier();
    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'INVALID_RESPONSE',
      details: { phase: 'check', outcome: 'unknown', jobId: JOB_ID },
    });
  });

  it('preserves permission failures without polling', async () => {
    state.startError = 'FORBIDDEN';
    const { envelope, exitCode } = await installByIdentifier();
    expect(exitCode).toBe(3);
    expect(envelope.error).toMatchObject({
      code: 'PERMISSION_DENIED',
      details: { phase: 'start', outcome: 'not-started' },
    });
    expect(server.requests).toHaveLength(1);
  });

  it('preserves the authentication recovery hint without polling', async () => {
    state.startError = 'UNAUTHENTICATED';
    const { envelope, exitCode } = await installByIdentifier();
    expect(exitCode).toBe(3);
    expect(envelope.error).toMatchObject({
      code: 'AUTH_REQUIRED',
      details: { phase: 'start', outcome: 'not-started' },
    });
    expect(envelope.error.hint).toContain('TWENTY_API_KEY');
    expect(server.requests).toHaveLength(1);
  });

  it('bounds waiting without claiming the server job was cancelled', async () => {
    timing.TIMEOUT_MILLISECONDS = 1_000;
    state.statuses = [jobStatus('ACTIVE')];
    const { envelope, exitCode } = await installByIdentifier();
    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'TIMEOUT',
      details: { phase: 'wait', outcome: 'unknown', jobId: JOB_ID },
    });
    expect(envelope.error.hint).toContain('does not cancel');
  });

  it('reports cancellation during polling with the queued job identifier', async () => {
    state.statuses = [jobStatus('ACTIVE')];
    const pending = installByIdentifier();
    await vi.waitFor(() => expect(server.requests.length).toBeGreaterThan(1));
    process.emit('SIGINT');
    const { envelope, exitCode } = await pending;
    expect(exitCode).toBe(130);
    expect(envelope.error).toMatchObject({
      code: 'CANCELLED',
      details: { phase: 'wait', outcome: 'unknown', jobId: JOB_ID },
    });
  });

  it('reports uncertainty when interrupted before receiving the job identifier', async () => {
    state.holdStart = true;
    const pending = installByIdentifier();
    await vi.waitFor(() => expect(state.heldResponse).toBeDefined());
    process.emit('SIGINT');
    const { envelope, exitCode } = await pending;
    expect(exitCode).toBe(130);
    expect(envelope.error).toMatchObject({
      code: 'CANCELLED',
      details: { phase: 'start', outcome: 'unknown' },
    });
  });

  it('prints success only after installation and appears as a target write command', async () => {
    const { exitCode, stdout } = await run(
      '--universal-identifier',
      UNIVERSAL_IDENTIFIER,
    );
    expect(exitCode).toBe(0);
    expect(stdout).toContain(`Installed Billing App on ${server.url}`);
    const catalog = await runCliForTest(['commands', '--json']);
    expect(parseSingleJsonLine(catalog.stdout).data.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'app install',
          writes: true,
          needsTarget: true,
          requiredPermissions: ['APPLICATIONS'],
        }),
      ]),
    );
  });
});
