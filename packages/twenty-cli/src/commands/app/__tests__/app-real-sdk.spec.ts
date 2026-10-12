import { existsSync } from 'node:fs';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readGraphqlRequest } from '@/__tests__/utils/read-graphql-request';
import { isArray } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
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

import { installTestClientSdk } from '@/app/__tests__/utils/install-test-client-sdk';
import { buildTestAppWorker } from '@/app/__tests__/utils/build-test-app-worker';

const buildMode = vi.hoisted(() => ({
  launch: { modulePath: '', execArgv: [] as string[] },
}));

vi.mock('@/app/get-app-worker-launch', () => ({
  getAppWorkerLaunch: () => buildMode.launch,
}));

const REPOSITORY_ROOT = fileURLToPath(
  new URL('../../../../../../', import.meta.url),
);

const APP_PATH = join(
  REPOSITORY_ROOT,
  'packages/twenty-apps/fixtures/minimal-app',
);

const snapshotsPath = (appPath: string) =>
  join(appPath, '.twenty', 'cli', 'snapshots');

const listSnapshots = async () =>
  existsSync(snapshotsPath(APP_PATH))
    ? await readdir(snapshotsPath(APP_PATH))
    : [];

const readManifestIdentifier = (variables: Record<string, unknown>) => {
  const manifest = isPlainObject(variables.manifest)
    ? variables.manifest
    : undefined;

  return isPlainObject(manifest?.application)
    ? manifest.application.universalIdentifier
    : undefined;
};

let syncedManifest: unknown;

const server = await startTestServer((request, response) => {
  if (request.method === 'PUT') {
    return sendJson(response, 200, {});
  }

  const { query, arguments: variables } = readGraphqlRequest(request);

  if (query.includes('syncApplication')) {
    if (!(variables.dryRun === true)) {
      syncedManifest = variables.manifest;
    }
    return sendJson(response, 200, {
      data: {
        syncApplication: {
          applicationUniversalIdentifier: readManifestIdentifier(variables),
          actions: [],
        },
      },
    });
  }

  if (query.includes('findOneApplication')) {
    return sendJson(response, 200, {
      data: {
        findOneApplication: {
          name: 'Root App',
          universalIdentifier: variables.universalIdentifier,
          canBeUninstalled: true,
        },
      },
    });
  }

  if (query.includes('uninstallApplication')) {
    return sendJson(response, 200, { data: { uninstallApplication: true } });
  }

  if (query.includes('createDevelopmentApplication')) {
    return sendJson(response, 200, {
      data: {
        createDevelopmentApplication: {
          id: 'application-id',
          universalIdentifier: variables.universalIdentifier,
        },
      },
    });
  }

  if (query.includes('createApplicationFileUploads')) {
    const files = isArray(variables.files) ? variables.files : [];

    return sendJson(response, 200, {
      data: {
        createApplicationFileUploads: {
          targets: files.filter(isPlainObject).map((file, index) => ({
            fileId: `file-${index}`,
            filePath: file.filePath,
            uploadUrl: `${server.url}/upload/file-${index}`,
            contentType: 'application/octet-stream',
          })),
          errors: [],
        },
      },
    });
  }

  if (query.includes('completeApplicationFileUploads')) {
    return sendJson(response, 200, {
      data: { completeApplicationFileUploads: { errors: [] } },
    });
  }

  if (query.includes('currentWorkspace')) {
    return sendJson(response, 200, {
      data: {
        currentWorkspace: { id: '48eb6ca1-dbd6-492e-8b53-5785a266c454' },
      },
    });
  }

  if (query.includes('exportApplication')) {
    return sendJson(response, 200, {
      data: {
        exportApplication: {
          application: {
            ...(isPlainObject(syncedManifest) &&
            isPlainObject(syncedManifest.application)
              ? syncedManifest.application
              : {}),
            sourceType: 'LOCAL',
          },
          manifest: syncedManifest,
          coverage: [],
          files: [],
        },
      },
    });
  }

  if (query.includes('applicationCoreGraphqlSchema')) {
    return sendJson(response, 200, {
      data: {
        applicationCoreGraphqlSchema: 'type Query { demoGreeting: String }',
      },
    });
  }

  return sendJson(response, 400, { errors: [{ message: 'Unexpected' }] });
});

const runJson = async (args: string[]) => {
  const result = await runCliForTest([...args, '--json']);

  return { ...result, envelope: parseSingleJsonLine(result.stdout) };
};

let workerDirectory: string;

beforeAll(async () => {
  workerDirectory = await mkdtemp(join(tmpdir(), 'twenty-real-apply-worker-'));
  await buildTestAppWorker(workerDirectory);
  buildMode.launch.modulePath = join(workerDirectory, 'app-worker.cjs');
}, 60000);

afterAll(async () => {
  await server.close();
  await rm(workerDirectory, { recursive: true, force: true });
});

describe('app commands with CLI snapshots', () => {
  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', 'real-sdk-test-key');
    vi.stubEnv('TWENTY_REMOTE', '');
    vi.stubEnv('CI', '');
    server.requests.length = 0;
  });

  afterEach(() => vi.unstubAllEnvs());

  it('builds a real app', async () => {
    const snapshotsBefore = await listSnapshots();
    const { envelope, exitCode } = await runJson([
      'app',
      'build',
      '--path',
      APP_PATH,
    ]);

    expect(exitCode, JSON.stringify(envelope)).toBe(0);
    expect(envelope.data.sdk).not.toHaveProperty('protocolVersion');
    expect(envelope.data.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: 'built-logic-function' }),
      ]),
    );
    expect(await listSnapshots()).toEqual(snapshotsBefore);
  }, 120_000);

  it('produces the same artifacts when invoked outside the app root', async () => {
    const originalDirectory = process.cwd();
    const builds = [];

    try {
      for (const directory of [
        APP_PATH,
        dirname(APP_PATH),
        join(APP_PATH, '.twenty'),
      ]) {
        process.chdir(directory);
        const result = await runJson(['app', 'build', '--path', APP_PATH]);
        expect(result.exitCode, JSON.stringify(result.envelope)).toBe(0);
        builds.push(result.envelope.data);
      }
    } finally {
      process.chdir(originalDirectory);
    }

    for (const build of builds.slice(1)) {
      expect(build.contentHash).toBe(builds[0].contentHash);
      expect(build.files).toEqual(builds[0].files);
      expect(build.manifest).toEqual(builds[0].manifest);
    }
  }, 120_000);

  it('builds, typechecks, previews, applies and uninstalls through the public pipeline', async () => {
    const appPath = await mkdtemp(join(tmpdir(), 'twenty-cli-real-apply-'));

    try {
      await cp(APP_PATH, appPath, {
        recursive: true,
        filter: (source) =>
          !['node_modules', '.twenty'].includes(basename(source)),
      });
      await mkdir(join(appPath, 'node_modules'));
      for (const name of [
        'twenty-sdk',
        'twenty-ui',
        'react',
        'react-dom',
        'typescript',
        '@types',
      ]) {
        await symlink(
          join(REPOSITORY_ROOT, 'node_modules', name),
          join(appPath, 'node_modules', name),
          'dir',
        );
      }
      {
        const sdkPath = join(appPath, 'node_modules', 'twenty-sdk');
        const repositorySdkPath = join(REPOSITORY_ROOT, 'packages/twenty-sdk');
        await rm(sdkPath);
        await mkdir(sdkPath);
        await cp(join(repositorySdkPath, 'dist'), join(sdkPath, 'dist'), {
          recursive: true,
          dereference: true,
        });
        await symlink(
          join(REPOSITORY_ROOT, 'node_modules'),
          join(sdkPath, 'node_modules'),
          'dir',
        );
        const sdkPackage = JSON.parse(
          await readFile(join(repositorySdkPath, 'package.json'), 'utf8'),
        );
        delete sdkPackage.exports['./build'];
        delete sdkPackage.exports['./build/descriptor.json'];
        await writeFile(
          join(sdkPath, 'package.json'),
          JSON.stringify(sdkPackage),
        );
      }
      const clientPath = join(appPath, 'node_modules', 'twenty-client-sdk');

      await installTestClientSdk(clientPath);
      await writeFile(
        join(clientPath, 'dist', 'metadata.cjs'),
        'metadata client',
      );
      for (const command of ['build', 'typecheck', 'plan']) {
        const result = await runJson(['app', command, '--path', appPath]);
        expect(result.exitCode, JSON.stringify(result.envelope)).toBe(0);
        expect(await readdir(snapshotsPath(appPath))).toEqual([]);
      }
      const { envelope, exitCode } = await runJson([
        'app',
        'apply',
        '--path',
        appPath,
      ]);
      const uploadTargets = server.requests.find(({ body, method }) =>
        method === 'POST'
          ? readGraphqlRequest({ body }).query.includes(
              'createApplicationFileUploads',
            )
          : false,
      );
      const puts = server.requests.filter(({ method }) => method === 'PUT');

      expect(exitCode, JSON.stringify(envelope)).toBe(0);
      expect(envelope.data.clientGeneration).toBe('generated');
      expect(envelope.data.pullBase).toBe('recorded');
      expect(
        JSON.parse(
          await readFile(join(appPath, '.twenty/cli/pull-base.json'), 'utf8'),
        ).manifest,
      ).toEqual(syncedManifest);
      expect(envelope.data.completedPhases.slice(-3)).toEqual([
        'sync',
        'pullBase',
        'clientGeneration',
      ]);
      expect(envelope.data.upload.fileCount).toBeGreaterThan(0);
      expect(puts).toHaveLength(envelope.data.upload.fileCount);
      expect(puts.every(({ body }) => body.length > 0)).toBe(true);
      expect(
        isDefined(uploadTargets) && readGraphqlRequest(uploadTargets).arguments,
      ).toMatchObject({
        files: expect.arrayContaining([
          expect.objectContaining({ fileFolder: 'BuiltLogicFunction' }),
        ]),
      });
      expect(await readdir(snapshotsPath(appPath))).toEqual([]);
      const uninstalled = await runJson([
        'app',
        'uninstall',
        '--path',
        appPath,
        '--yes',
      ]);
      expect(uninstalled.exitCode, JSON.stringify(uninstalled.envelope)).toBe(
        0,
      );
      expect(uninstalled.envelope.data.completedPhases).toEqual([
        'build',
        'check',
        'uninstall',
      ]);
      expect(await readdir(snapshotsPath(appPath))).toEqual([]);
      expect(
        await readFile(
          join(clientPath, 'dist', 'core/generated/schema.graphql'),
          'utf8',
        ),
      ).toContain('demoGreeting: String');
      expect(
        createRequire(import.meta.url)(join(clientPath, 'dist', 'core.cjs')),
      ).toHaveProperty('CoreApiClient');
      expect(
        await readFile(join(clientPath, 'dist', 'metadata.cjs'), 'utf8'),
      ).toBe('metadata client');
    } finally {
      await rm(appPath, { recursive: true, force: true });
    }
  }, 120_000);
});
