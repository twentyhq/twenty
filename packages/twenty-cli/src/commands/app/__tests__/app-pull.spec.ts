import {
  access,
  appendFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { MetadataWritability } from 'twenty-shared/types';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
import { buildTestAppWorker } from '@/app/__tests__/utils/build-test-app-worker';
import {
  createSourceTestApp,
  sourceApplication,
  SOURCE_TEST_APPLICATION_ID,
} from '@/app/source/__tests__/utils/create-source-test-app';
import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';

const launch = vi.hoisted(() => ({ modulePath: '', execArgv: [] as string[] }));
vi.mock('@/app/get-app-worker-launch', () => ({
  getAppWorkerLaunch: () => launch,
}));
const OBJECT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const WORKSPACE_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const BASE_PATH = '.twenty/cli/pull-base.json';
const createExport = () => ({
  application: {
    universalIdentifier: SOURCE_TEST_APPLICATION_ID,
    displayName: 'Source app',
    sourceType: 'LOCAL',
  },
  manifest: {
    application: {
      universalIdentifier: SOURCE_TEST_APPLICATION_ID,
      displayName: 'Source app',
    },
    objects: [
      {
        universalIdentifier: OBJECT_ID,
        nameSingular: 'pet',
        namePlural: 'pets',
        labelSingular: 'Pet',
        labelPlural: 'Pets',
        fields: [],
      },
    ],
    fields: [],
  },
  coverage: [] as {
    metadataName: string;
    universalIdentifier: string;
    status: string;
    reason: string | null;
  }[],
  files: [] as { folder: string; path: string; content: string }[],
});
let exported = createExport();
let forbidden = false;
const server = await startTestServer((request, response) => {
  if (request.body.includes('currentWorkspace')) {
    return sendJson(response, 200, {
      data: { currentWorkspace: { id: WORKSPACE_ID } },
    });
  }
  if (forbidden) {
    return sendJson(response, 403, { message: 'Forbidden' });
  }
  return sendJson(response, 200, { data: { exportApplication: exported } });
});

describe('app pull command with the packaged worker', () => {
  let appPath: string;
  let workerPath: string;
  let sdkPath: string;
  const run = (...args: string[]) =>
    runCliForTest(['app', 'pull', '--path', appPath, ...args]);
  const runJson = async (...args: string[]) => {
    const result = await run(...args, '--json');
    return { ...result, envelope: parseSingleJsonLine(result.stdout) };
  };
  beforeAll(async () => {
    workerPath = await mkdtemp(join(tmpdir(), 'twenty-pull-worker-'));
    launch.modulePath = join(workerPath, 'app-worker.cjs');
    await buildTestAppWorker(workerPath);
  });
  afterAll(async () => {
    await server.close();
    await rm(workerPath, { recursive: true, force: true });
  });
  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-cli-pull-'));
    sdkPath = await createSourceTestApp(appPath);
    await writeFile(join(appPath, 'app.ts'), sourceApplication());
    exported = createExport();
    forbidden = false;
    server.requests.length = 0;
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', 'must-not-reach-source');
    vi.stubEnv('TWENTY_REMOTE', '');
    vi.stubEnv('CI', 'true');
  });
  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(appPath, { recursive: true, force: true });
  });

  it('pulls without an SDK build entry or compiler, preserves pins and emits one JSON result', async () => {
    await writeFile(
      join(appPath, 'app.ts'),
      sourceApplication(
        "if (process.env.TWENTY_API_KEY) throw new Error('credential leaked'); console.log('project noise');",
      ),
    );
    await writeFile(join(appPath, 'yarn.lock'), 'keep-this-lock');
    const packageJson = await readFile(join(appPath, 'package.json'), 'utf8');
    const result = await runJson();
    expect(result.exitCode, JSON.stringify(result.envelope)).toBe(0);
    expect(result.envelope.data).toMatchObject({
      pulled: true,
      base: { status: 'missing' },
      application: { universalIdentifier: SOURCE_TEST_APPLICATION_ID },
    });
    expect(result.envelope.data.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'PROJECT_OUTPUT',
        message: expect.stringContaining('project noise'),
      }),
    );
    expect(
      result.envelope.data.writes.every(
        (write: Record<string, unknown>) =>
          !('content' in write) && !('requiredSdkExports' in write),
      ),
    ).toBe(true);
    expect(
      await readFile(join(appPath, 'src/objects/pet.object.ts'), 'utf8'),
    ).toContain('defineObject');
    expect(
      JSON.parse(await readFile(join(appPath, BASE_PATH), 'utf8')),
    ).toMatchObject({
      target: { apiUrl: server.url, workspaceId: WORKSPACE_ID },
    });
    expect((await stat(join(appPath, BASE_PATH))).mode & 0o777).toBe(0o600);
    expect(await readFile(join(appPath, 'package.json'), 'utf8')).toBe(
      packageJson,
    );
    expect(await readFile(join(appPath, 'yarn.lock'), 'utf8')).toBe(
      'keep-this-lock',
    );
    expect(
      server.requests.every((request) => !request.body.includes('mutation')),
    ).toBe(true);
    expect((await runJson()).envelope.data.writes).toEqual([]);
  });

  it('refuses incompatible writer exports before any destination changes', async () => {
    await appendFile(
      join(sdkPath, 'define.cjs'),
      '\ndelete exports.defineObject;',
    );
    const original = await readFile(join(appPath, 'app.ts'), 'utf8');
    const result = await runJson();
    expect(result.exitCode).toBe(1);
    expect(result.envelope.error).toMatchObject({
      code: 'SDK_SOURCE_UNSUPPORTED',
      details: { outcome: 'unchanged', missingNames: ['defineObject'] },
    });
    expect(await readFile(join(appPath, 'app.ts'), 'utf8')).toBe(original);
    expect((await readdir(appPath)).sort()).toEqual([
      'app.ts',
      'node_modules',
      'package.json',
    ]);
  });

  it('preserves the source recovery hint instead of suggesting an unrelated SDK upgrade', async () => {
    await writeFile(
      join(appPath, 'invalid.object.ts'),
      `const defineObject = (config: unknown) => config;
export default defineObject({ nameSingular: 'invalid' });`,
    );
    const result = await runJson();

    expect(result.exitCode).toBe(1);
    expect(result.envelope.error).toMatchObject({
      code: 'SDK_SOURCE_UNSUPPORTED',
      hint: 'Use the SDK define functions, rename local helpers with the same names, or install a compatible twenty-sdk version.',
      details: { outcome: 'unchanged' },
    });
    expect(await readdir(appPath)).toContain('invalid.object.ts');
    expect(await readdir(appPath)).not.toContain('.twenty');
  });

  it('checks enum imports actually used by generated files', async () => {
    const state = JSON.parse(JSON.stringify(exported));
    state.manifest.objects[0].writability = MetadataWritability.APPLICATION;
    exported = state;
    const result = await runJson();
    expect(result.envelope.error).toMatchObject({
      code: 'SDK_SOURCE_UNSUPPORTED',
      details: { missingNames: ['MetadataWritability'] },
    });
  });

  it('requires an explicit UUID in a project without an app definition', async () => {
    await rm(join(appPath, 'app.ts'));
    expect((await runJson()).envelope.error.code).toBe('INVALID_INPUT');
    expect(server.requests).toHaveLength(0);
    expect(
      (
        await runJson(
          '--universal-identifier',
          SOURCE_TEST_APPLICATION_ID.toUpperCase(),
        )
      ).exitCode,
    ).toBe(0);
  });

  it('rejects a different app before requesting the export', async () => {
    expect(
      (await runJson('--universal-identifier', OBJECT_ID)).envelope.error.code,
    ).toBe('INVALID_INPUT');
    expect(server.requests).toHaveLength(0);
  });

  it('leaves local files untouched when server authorization fails', async () => {
    forbidden = true;
    const original = await readFile(join(appPath, 'app.ts'), 'utf8');
    expect((await runJson()).exitCode).toBe(3);
    expect(await readFile(join(appPath, 'app.ts'), 'utf8')).toBe(original);
    expect((await readdir(appPath)).sort()).toEqual([
      'app.ts',
      'node_modules',
      'package.json',
    ]);
  });

  it('rejects exported source and dependency files before writes', async () => {
    exported.files.push({ folder: '.', path: 'package.json', content: '{}' });
    expect((await runJson()).envelope.error.code).toBe('TOOLING_UNSUPPORTED');
    expect((await readdir(appPath)).sort()).toEqual([
      'app.ts',
      'node_modules',
      'package.json',
    ]);
  });

  it('reports coverage gaps in human and machine output, without a prompt', async () => {
    exported.coverage.push({
      metadataName: 'futureEntity',
      universalIdentifier: OBJECT_ID,
      status: 'FUTURE_STATUS',
      reason: 'Not supported yet',
    });
    const result = await runJson();
    expect(result.exitCode).toBe(0);
    expect(result.envelope.data.coverage).toEqual(exported.coverage);
    const human = await run('--verbose');
    expect(human.exitCode).toBe(0);
    expect(human.stdout).toContain('FUTURE_STATUS');
  });

  it('contains a process exit during reconciliation and reports an unknown outcome', async () => {
    await mkdir(join(appPath, 'src'));
    await writeFile(
      join(appPath, 'src/broken.object.ts'),
      "import { defineObject } from 'twenty-sdk/define'; process.exit(17); export default defineObject({});",
    );
    const result = await runJson();
    expect(result.envelope.error).toMatchObject({
      code: 'WORKER_FAILED',
      details: { outcome: 'unknown', exitCode: 17 },
    });
    expect(result.envelope.error.hint).toContain('pull-backup-');
  });
  it('reports unknown after forced cancellation mid-commit and retains recoverable backups', async () => {
    const startedPath = join(appPath, 'commit-started');
    const original = sourceApplication(`
      import { createRequire } from 'node:module';
      const filesystem = createRequire(process.cwd() + '/package.json')('node:fs/promises');
      const originalCopy = filesystem.cp;
      filesystem.cp = async (...args) => {
        await originalCopy(...args);
        if (args[0].includes('pull-staging-') && args[1] === ${JSON.stringify(join(appPath, 'app.ts'))}) {
          await filesystem.writeFile(${JSON.stringify(startedPath)}, 'started');
          await new Promise(() => {});
        }
      };
    `);
    await writeFile(join(appPath, 'app.ts'), original);
    const pending = runJson();
    try {
      await vi.waitFor(() => access(startedPath), {
        timeout: 10000,
        interval: 20,
      });
    } finally {
      process.emit('SIGINT');
    }
    const result = await pending;
    expect(result.exitCode).toBe(130);
    expect(result.envelope.error).toMatchObject({
      code: 'CANCELLED',
      details: { outcome: 'unknown' },
    });
    expect(await readFile(join(appPath, 'app.ts'), 'utf8')).not.toBe(original);
    await expect(access(join(appPath, BASE_PATH))).rejects.toMatchObject({
      code: 'ENOENT',
    });
    const backup = (await readdir(join(appPath, '.twenty/cli'))).find((name) =>
      name.startsWith('pull-backup-'),
    );
    expect(backup).toBeDefined();
    expect(
      await readFile(
        join(appPath, '.twenty/cli', backup ?? '', 'app.ts'),
        'utf8',
      ),
    ).toBe(original);
  }, 15000);
});
