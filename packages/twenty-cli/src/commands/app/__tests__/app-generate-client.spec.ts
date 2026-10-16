import { buildTestAppWorker } from '@/app/__tests__/utils/build-test-app-worker';
import { writeTestSourceSdk } from '@/app/__tests__/utils/write-test-source-sdk';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';

import { readGraphqlRequest } from '@/__tests__/utils/read-graphql-request';
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
import { readAppIdentity } from '@/app/read-app-identity';

const worker = vi.hoisted(() => ({ modulePath: '', execArgv: [] as string[] }));

vi.mock('@/app/get-app-worker-launch', () => ({
  getAppWorkerLaunch: () => worker,
}));
vi.mock('@/app/read-app-identity');

const UNIVERSAL_IDENTIFIER = '6a0c9d8e-8f5f-4c43-9b8e-0e1f2a3b4c5d';
const SCHEMA =
  'type Query { companies: [Company!]! } type Company { id: ID! name: String! }';

let workerDirectory: string;
let appPath: string;
let schemaResponse: unknown;

const server = await startTestServer((_request, response) =>
  sendJson(response, 200, schemaResponse),
);

const run = (...options: string[]) =>
  runCliForTest(['app', 'generate-client', '--path', appPath, ...options]);

const expectIdentityReadOnce = () => {
  expect(readAppIdentity).toHaveBeenCalledTimes(1);
  expect(readAppIdentity).toHaveBeenCalledWith({
    appPath,
    signal: expect.any(AbortSignal),
  });
};

beforeAll(async () => {
  workerDirectory = await mkdtemp(
    join(tmpdir(), 'twenty-generate-client-worker-'),
  );
  await buildTestAppWorker(workerDirectory, { useToolingFixture: true });
  worker.modulePath = join(workerDirectory, 'app-worker.cjs');
}, 60_000);

afterAll(async () => {
  await server.close();
  await rm(workerDirectory, { recursive: true, force: true });
});

beforeEach(async () => {
  appPath = await mkdtemp(join(tmpdir(), 'twenty-cli-generate-client-'));
  await writeFile(
    join(appPath, 'package.json'),
    JSON.stringify({
      name: 'generate-app',
      devDependencies: { 'twenty-sdk': '9.9.9' },
    }),
  );
  await writeTestSourceSdk({ appPath });
  await mkdir(join(appPath, 'node_modules', 'twenty-client-sdk'), {
    recursive: true,
  });
  await writeFile(
    join(appPath, 'test-tooling.cjs'),
    `
    const fs = require('node:fs');
    const path = require('node:path');
    exports.generateApplicationClient = async ({ appPath, schema }) => {
      fs.writeFileSync(path.join(appPath, 'generated.json'), JSON.stringify({ appPath, schema }));
      return { success: true, data: null, diagnostics: [] };
    };
    `,
  );
  schemaResponse = { data: { applicationCoreGraphqlSchema: SCHEMA } };
  vi.mocked(readAppIdentity)
    .mockReset()
    .mockResolvedValue({
      application: {
        universalIdentifier: UNIVERSAL_IDENTIFIER.toUpperCase(),
        displayName: 'Generate App',
      },
      diagnostics: [],
    });
  vi.stubEnv('TWENTY_API_URL', server.url);
  vi.stubEnv('TWENTY_API_KEY', 'generate-test-key');
  vi.stubEnv('TWENTY_REMOTE', '');
  vi.stubEnv('CI', '');
  server.requests.length = 0;
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(appPath, { recursive: true, force: true });
});

describe('app generate-client', () => {
  it('regenerates the client from the workspace schema without building or syncing', async () => {
    const { stdout, exitCode } = await run('--json');

    expect(exitCode).toBe(0);
    expect(parseSingleJsonLine(stdout).data).toMatchObject({
      app: { path: appPath, name: 'generate-app' },
      sdk: { version: '9.9.9' },
      client: { path: join(appPath, 'node_modules', 'twenty-client-sdk') },
      application: { displayName: 'Generate App' },
    });
    expect(server.requests).toHaveLength(1);
    expect(server.requests[0]).toMatchObject({
      path: '/metadata',
      headers: { authorization: 'Bearer generate-test-key' },
    });
    expect(readGraphqlRequest(server.requests[0]).arguments).toEqual({
      applicationUniversalIdentifier: UNIVERSAL_IDENTIFIER,
    });
    expect(
      JSON.parse(await readFile(join(appPath, 'generated.json'), 'utf8')),
    ).toEqual({ appPath, schema: SCHEMA });
    expectIdentityReadOnce();
  });

  it('confirms the generated client and its location in cyan in human output', async () => {
    vi.stubEnv('NO_COLOR', undefined);
    vi.stubEnv('FORCE_COLOR', '1');

    const { stdout, exitCode } = await run();

    expect(exitCode).toBe(0);
    expect(stdout).toContain(
      `Generated the typed API client for Generate App from ${server.url}`,
    );
    expect(stdout).toContain(
      `Saved in \u001b[36m${join(appPath, 'node_modules', 'twenty-client-sdk')}\u001b[39m`,
    );
    expectIdentityReadOnce();
  });

  it('shows the client location relative to the current folder when the app is inside it', async () => {
    vi.stubEnv('FORCE_COLOR', undefined);
    vi.stubEnv('NO_COLOR', '1');
    const workingDirectory = vi.spyOn(process, 'cwd');

    try {
      workingDirectory.mockReturnValue(appPath);
      const fromApp = await run();
      const fromAppJson = await run('--json');

      workingDirectory.mockReturnValue(dirname(appPath));
      const fromParent = await run();

      expect(fromApp.stdout).toContain(
        `Saved in ${join('node_modules', 'twenty-client-sdk')}`,
      );
      expect(fromParent.stdout).toContain(
        `Saved in ${join(basename(appPath), 'node_modules', 'twenty-client-sdk')}`,
      );
      expect(parseSingleJsonLine(fromAppJson.stdout).data.client).toEqual({
        path: join(appPath, 'node_modules', 'twenty-client-sdk'),
      });
    } finally {
      workingDirectory.mockRestore();
    }
  });

  it('refuses an app without its own twenty-client-sdk before contacting the workspace', async () => {
    await rm(join(appPath, 'node_modules', 'twenty-client-sdk'), {
      recursive: true,
      force: true,
    });

    const { stdout, exitCode } = await run('--json');

    expect(exitCode).toBe(1);
    expect(parseSingleJsonLine(stdout).error).toMatchObject({
      code: 'CLIENT_SDK_NOT_INSTALLED',
      hint: expect.stringContaining('yarn add twenty-client-sdk'),
    });
    expect(server.requests).toEqual([]);
    expect(readAppIdentity).not.toHaveBeenCalled();
  });

  it('asks to apply an app that is not installed in the workspace', async () => {
    schemaResponse = {
      data: null,
      errors: [
        {
          message: 'Application not found',
          extensions: { code: 'NOT_FOUND', subCode: 'APPLICATION_NOT_FOUND' },
        },
      ],
    };

    const { stdout, exitCode } = await run('--json');

    expect(exitCode).toBe(4);
    expect(parseSingleJsonLine(stdout).error).toMatchObject({
      code: 'APP_NOT_INSTALLED',
      hint: expect.stringContaining('twenty app apply'),
    });
    expect(existsSync(join(appPath, 'generated.json'))).toBe(false);
    expectIdentityReadOnce();
  });

  it('rejects a project without an application definition', async () => {
    vi.mocked(readAppIdentity).mockResolvedValue({
      application: null,
      diagnostics: [],
    });

    const { stdout, exitCode } = await run('--json');

    expect(exitCode).toBe(2);
    expect(parseSingleJsonLine(stdout).error).toMatchObject({
      code: 'INVALID_INPUT',
    });
    expect(server.requests).toEqual([]);
    expectIdentityReadOnce();
  });
});
