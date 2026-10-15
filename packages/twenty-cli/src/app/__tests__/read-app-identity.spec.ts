import { access, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';

import { buildTestAppWorker } from '@/app/__tests__/utils/build-test-app-worker';
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

import { readAppIdentity } from '@/app/read-app-identity';
import {
  createSourceTestApp,
  sourceApplication,
  SOURCE_TEST_APPLICATION_ID,
} from '@/app/source/__tests__/utils/create-source-test-app';

const launch = vi.hoisted(() => ({ modulePath: '', execArgv: [] as string[] }));

vi.mock('@/app/get-app-worker-launch', () => ({
  getAppWorkerLaunch: () => launch,
}));

describe('isolated CLI source worker', () => {
  let appPath: string;
  let workerPath: string;
  let controller: AbortController;

  beforeAll(async () => {
    workerPath = await mkdtemp(join(tmpdir(), 'twenty-source-worker-'));
    launch.modulePath = join(workerPath, 'app-worker.cjs');
    await buildTestAppWorker(workerPath);
  });
  afterAll(async () => rm(workerPath, { recursive: true, force: true }));

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-identity-'));
    controller = new AbortController();
    await createSourceTestApp(appPath);
  });
  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(appPath, { recursive: true, force: true });
  });

  it('loads with an authoring-only SDK and captures source output separately', async () => {
    await writeFile(
      join(appPath, 'app.ts'),
      sourceApplication(
        'console.log("hello from source"); console.error("source warning");',
      ),
    );
    const result = await readAppIdentity({
      appPath,
      signal: controller.signal,
    });

    expect(result.application?.universalIdentifier).toBe(
      SOURCE_TEST_APPLICATION_ID,
    );
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'PROJECT_OUTPUT',
        message: expect.stringContaining('hello from source'),
      }),
      expect.objectContaining({
        code: 'PROJECT_OUTPUT',
        message: expect.stringContaining('source warning'),
      }),
    ]);
  });

  it('does not pass selected workspace credentials to evaluated source', async () => {
    vi.stubEnv('TWENTY_API_KEY', 'must-not-reach-app');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'must-not-reach-app');
    await writeFile(
      join(appPath, 'app.ts'),
      sourceApplication(`
      if (process.env.TWENTY_API_KEY || process.env.TWENTY_APP_ACCESS_TOKEN) throw new Error('credential leaked');
    `),
    );
    expect(
      (await readAppIdentity({ appPath, signal: controller.signal }))
        .application,
    ).not.toBeNull();
  });

  it('preserves a typed failure for incompatible SDK definition results', async () => {
    await writeFile(
      join(appPath, 'node_modules/twenty-sdk/define.cjs'),
      'exports.defineApplication = (config) => config;',
    );
    await writeFile(join(appPath, 'app.ts'), sourceApplication());
    await expect(
      readAppIdentity({ appPath, signal: controller.signal }),
    ).rejects.toMatchObject({ code: 'SDK_SOURCE_UNSUPPORTED' });
  });

  it('contains process.exit in app source', async () => {
    await writeFile(
      join(appPath, 'app.ts'),
      sourceApplication('process.exit(17);'),
    );
    await expect(
      readAppIdentity({ appPath, signal: controller.signal }),
    ).rejects.toMatchObject({
      code: 'WORKER_FAILED',
      details: { exitCode: 17 },
    });
  });

  it('kills a busy source worker when cancelled', async () => {
    const startedPath = join(appPath, 'started');
    await writeFile(
      join(appPath, 'app.ts'),
      sourceApplication(`
      import { writeFileSync } from 'node:fs';
      writeFileSync(${JSON.stringify(startedPath)}, 'started');
      while (true) {}
    `),
    );
    const result = readAppIdentity({ appPath, signal: controller.signal }).then(
      (value) => ({ value }),
      (error: unknown) => ({ error }),
    );

    try {
      const deadline = Date.now() + 5000;
      while (
        !(await access(startedPath).then(
          () => true,
          () => false,
        ))
      ) {
        if (Date.now() > deadline) {
          throw new Error('The source worker did not start.');
        }
        await setTimeout(20);
      }
    } finally {
      controller.abort();
      expect(await result).toMatchObject({
        error: { code: 'CANCELLED', exitCode: 130 },
      });
    }
  }, 10_000);
});
