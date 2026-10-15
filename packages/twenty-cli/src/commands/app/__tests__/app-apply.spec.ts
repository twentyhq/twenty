import { buildTestAppWorker } from '@/app/__tests__/utils/build-test-app-worker';
import { writeTestSourceSdk } from '@/app/__tests__/utils/write-test-source-sdk';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { readGraphqlRequest } from '@/__tests__/utils/read-graphql-request';
import { isArray, isString } from '@sniptt/guards';
import { type ServerResponse } from 'node:http';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
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
  universalIdentifier: '6a0c9d8e-8f5f-4c43-9b8e-0e1f2a3b4c5d',
  name: 'apply-app',
  displayName: 'Apply App',
};
const MANIFEST = { application: APPLICATION };
const WORKSPACE_ID = '48eb6ca1-dbd6-492e-8b53-5785a266c454';
const EXPORTED_MANIFEST = {
  application: { ...APPLICATION, displayName: 'Server-normalized app' },
  objects: [],
  fields: [],
  logicFunctions: [],
  frontComponents: [],
  permissionFlags: [],
  roles: [],
  skills: [],
  agents: [],
  views: [],
  viewFields: [],
  navigationMenuItems: [],
  pageLayouts: [],
  pageLayoutTabs: [],
  pageLayoutWidgets: [],
  commandMenuItems: [],
  timelineActivityTypes: [],
  settingsMenuItems: [],
  publicAssets: [],
};
const APPLICATION_EXPORT = {
  application: { ...APPLICATION, sourceType: 'LOCAL' },
  manifest: EXPORTED_MANIFEST,
  coverage: [],
  files: [],
};
const FILES = [
  {
    path: 'logic-functions/hello.mjs',
    role: 'built-logic-function',
    content: 'export default () => "hello";',
  },
  { path: 'public/logo.svg', role: 'public-asset', content: '<svg></svg>' },
];
const CREATE_ACTION = {
  type: 'create',
  metadataName: 'logicFunction',
  flatEntity: { name: 'hello' },
};
const OBJECT_DELETION = {
  type: 'delete',
  metadataName: 'objectMetadata',
  universalIdentifier: 'object-id',
  flatEntity: { nameSingular: 'invoice' },
};
const SCHEMA =
  'type Query { companies: [Company!]! } type Company { id: ID! name: String! }';

type ServerState = {
  isRegistered: boolean;
  previewActions: unknown[];
  registrationError?: string;
  installError?: string;
  uploadTargetsStatus?: number;
  completeError?: string;
  syncError?: string;
  syncResponseOverride?: unknown;
  failingUploadFileId?: string;
  hasInvalidFirstUploadUrl: boolean;
  heldUploadFileId?: string;
  wasSnapshotPresentDuringHeldUpload?: boolean;
  isSyncHeld: boolean;
  heldSyncResponse?: ServerResponse;
  wasSnapshotPresentAtSync?: boolean;
  snapshotPath: string;
  workspaceResponse?: unknown;
  exportResponse?: unknown;
  exportStatus?: number;
  isExportHeld?: boolean;
  heldExportResponse?: ServerResponse;
  schemaResponse?: unknown;
  schemaError?: string;
  isSchemaHeld?: boolean;
  heldSchemaResponse?: ServerResponse;
};

const state: ServerState = {
  isRegistered: true,
  previewActions: [CREATE_ACTION],
  hasInvalidFirstUploadUrl: false,
  isSyncHeld: false,
  snapshotPath: '',
};

const graphqlError = (code: string, subCode?: string) => ({
  data: null,
  errors: [
    {
      message: 'The server refused the request.',
      extensions: { code, subCode },
    },
  ],
});

const getOperation = (request: RecordedRequest) => {
  if (request.method === 'PUT') {
    return 'put';
  }

  const { query, arguments: variables } = readGraphqlRequest(request);

  if (variables.dryRun === true) {
    return 'preview';
  }

  return (
    [
      ['createApplicationRegistration', 'registration'],
      ['createDevelopmentApplication', 'installation'],
      ['createApplicationFileUploads', 'upload-targets'],
      ['completeApplicationFileUploads', 'upload-complete'],
      ['syncApplication', 'sync'],
      ['applicationCoreGraphqlSchema', 'schema'],
      ['currentWorkspace', 'workspace'],
      ['exportApplication', 'export'],
    ].find(([field]) => query.includes(field))?.[1] ?? 'unknown'
  );
};

const readUniversalIdentifier = (variables: Record<string, unknown>) => {
  const manifest = isPlainObject(variables.manifest)
    ? variables.manifest
    : undefined;
  const application = isPlainObject(manifest?.application)
    ? manifest.application
    : undefined;
  const input = isPlainObject(variables.input) ? variables.input : undefined;

  return [
    application?.universalIdentifier,
    input?.universalIdentifier,
    variables.universalIdentifier,
  ]
    .find(isString)
    ?.toLowerCase();
};

const syncResponse = (variables: Record<string, unknown>) => ({
  data: {
    syncApplication: {
      applicationUniversalIdentifier: readUniversalIdentifier(variables),
      actions: state.previewActions,
    },
  },
});

const server = await startTestServer((request, response) => {
  const operation = getOperation(request);

  if (operation === 'put') {
    if (request.path.endsWith(`/${state.heldUploadFileId}`)) {
      setTimeout(() => {
        state.wasSnapshotPresentDuringHeldUpload = existsSync(
          state.snapshotPath,
        );
        sendJson(response, 200, {});
      }, 300);

      return;
    }

    return sendJson(
      response,
      request.path.endsWith(`/${state.failingUploadFileId}`) ? 500 : 200,
      {},
    );
  }

  const { arguments: variables } = readGraphqlRequest(request);

  if (operation === 'preview') {
    return sendJson(
      response,
      200,
      state.isRegistered
        ? syncResponse(variables)
        : graphqlError('NOT_FOUND', 'APPLICATION_NOT_FOUND'),
    );
  }

  if (operation === 'registration') {
    if (isDefined(state.registrationError)) {
      state.isRegistered = true;

      return sendJson(response, 200, graphqlError(state.registrationError));
    }

    state.isRegistered = true;

    return sendJson(response, 200, {
      data: {
        createApplicationRegistration: {
          applicationRegistration: {
            id: 'registration-id',
            universalIdentifier: readUniversalIdentifier(variables),
          },
        },
      },
    });
  }

  if (operation === 'installation') {
    return sendJson(
      response,
      200,
      isDefined(state.installError)
        ? graphqlError(state.installError)
        : {
            data: {
              createDevelopmentApplication: {
                id: 'application-id',
                universalIdentifier: readUniversalIdentifier(variables),
              },
            },
          },
    );
  }

  if (operation === 'upload-targets') {
    if (isDefined(state.uploadTargetsStatus)) {
      return sendJson(response, state.uploadTargetsStatus, {
        message: 'Storage is unavailable.',
      });
    }

    const files = isArray(variables.files) ? variables.files : [];

    return sendJson(response, 200, {
      data: {
        createApplicationFileUploads: {
          targets: files.filter(isPlainObject).map((file, index) => ({
            fileId: `file-${index}`,
            filePath: file.filePath,
            uploadUrl:
              state.hasInvalidFirstUploadUrl && index === 0
                ? 'ftp://storage.example.com/upload'
                : `${server.url}/upload/file-${index}`,
            contentType: 'application/octet-stream',
          })),
          errors: [],
        },
      },
    });
  }

  if (operation === 'upload-complete') {
    return sendJson(
      response,
      200,
      isDefined(state.completeError)
        ? graphqlError(state.completeError)
        : { data: { completeApplicationFileUploads: { errors: [] } } },
    );
  }

  if (operation === 'sync') {
    state.wasSnapshotPresentAtSync = existsSync(state.snapshotPath);

    if (isDefined(state.syncError)) {
      return sendJson(response, 200, graphqlError(state.syncError));
    }

    if (isDefined(state.syncResponseOverride)) {
      return sendJson(response, 200, state.syncResponseOverride);
    }

    if (state.isSyncHeld) {
      state.heldSyncResponse = response;

      return;
    }

    return sendJson(response, 200, syncResponse(variables));
  }

  if (operation === 'workspace') {
    return sendJson(
      response,
      200,
      state.workspaceResponse ?? {
        data: { currentWorkspace: { id: WORKSPACE_ID } },
      },
    );
  }

  if (operation === 'export') {
    if (state.isExportHeld) {
      state.heldExportResponse = response;
      return;
    }
    return sendJson(
      response,
      state.exportStatus ?? 200,
      state.exportResponse ?? {
        data: { exportApplication: APPLICATION_EXPORT },
      },
    );
  }

  if (operation === 'schema') {
    if (state.isSchemaHeld) {
      state.heldSchemaResponse = response;

      return;
    }

    if (
      variables.applicationUniversalIdentifier !==
      APPLICATION.universalIdentifier
    ) {
      return sendJson(
        response,
        200,
        graphqlError('NOT_FOUND', 'APPLICATION_NOT_FOUND'),
      );
    }

    return sendJson(
      response,
      200,
      isDefined(state.schemaError)
        ? graphqlError(state.schemaError)
        : (state.schemaResponse ?? {
            data: { applicationCoreGraphqlSchema: SCHEMA },
          }),
    );
  }

  return sendJson(response, 400, { errors: [{ message: 'Unexpected' }] });
});

describe('app apply', () => {
  let appPath: string;

  const run = (...args: string[]) =>
    runCliForTest(['app', 'apply', '--path', appPath, ...args]);
  const runJson = async (...args: string[]) => {
    const result = await run(...args, '--json');

    return { ...result, envelope: parseSingleJsonLine(result.stdout) };
  };
  const operations = () => server.requests.map(getOperation);
  const readReleasedBuildId = () =>
    readFile(join(appPath, 'released.txt'), 'utf8');

  const writeTooling = async ({
    corruptPath,
    application = APPLICATION,
    generateClientBody,
    editDuringBuild,
  }: {
    corruptPath?: string;
    application?: typeof APPLICATION;
    generateClientBody?: string;
    editDuringBuild?: { relativePath: string; content: string };
  } = {}) => {
    await writeFile(
      join(appPath, 'test-tooling.cjs'),
      `
      const fs = require('node:fs');
      const path = require('node:path');
      const { createHash } = require('node:crypto');
      const FILES = ${JSON.stringify(FILES)};
      const CORRUPT_PATH = ${JSON.stringify(corruptPath ?? null)};
      const EDIT_DURING_BUILD = ${JSON.stringify(editDuringBuild ?? null)};
      const sha256 = (content) => createHash('sha256').update(content).digest('hex');
      let snapshotDirectory;
      exports.buildSourceSnapshot = async ({ appPath }) => {
        if (EDIT_DURING_BUILD) {
          fs.writeFileSync(path.join(appPath, EDIT_DURING_BUILD.relativePath), EDIT_DURING_BUILD.content);
        }
        snapshotDirectory = path.join(appPath, '.twenty', 'cli', 'snapshots', 'build-test');
        const filesDirectory = path.join(snapshotDirectory, 'files');
        const files = FILES.map((file) => {
          const absolutePath = path.join(filesDirectory, file.path);
          fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
          fs.writeFileSync(absolutePath, file.content);
          return {
            path: file.path,
            role: file.role,
            sourcePath: 'src/' + path.basename(file.path),
            size: Buffer.byteLength(file.content),
            sha256: sha256(file.path === CORRUPT_PATH ? 'changed' : file.content),
          };
        });
        return {
          success: true,
          data: {
            buildId: 'build-id',
            directory: filesDirectory,
            contentHash: 'a'.repeat(64),
            application: ${JSON.stringify(application)},
            manifestFormat: 'twenty-application',
            manifest: ${JSON.stringify({ application })},
            files,
          },
          diagnostics: [],
        };
      };
      exports.releaseSourceSnapshot = async ({ buildId }) => {
        fs.rmSync(snapshotDirectory, { recursive: true, force: true });
        fs.writeFileSync(path.join(__dirname, 'released.txt'), buildId);
        return { success: true, data: null, diagnostics: [] };
      };
      ${isDefined(generateClientBody) ? `exports.generateApplicationClient = async ({ appPath, schema, signal }) => { ${generateClientBody} };` : ''}
    `,
    );
  };

  const enableClientGeneration = async (
    body?: string,
    application = APPLICATION,
  ) => {
    await mkdir(join(appPath, 'node_modules', 'twenty-client-sdk'), {
      recursive: true,
    });

    await writeTooling({ generateClientBody: body, application });
  };

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-cli-apply-'));
    await writeFile(
      join(appPath, 'package.json'),
      JSON.stringify({
        name: 'apply-app',
        devDependencies: { 'twenty-sdk': '9.9.9' },
      }),
    );
    await writeTestSourceSdk({ appPath });
    await writeTooling();
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', 'apply-test-key');
    vi.stubEnv('TWENTY_REMOTE', '');
    vi.stubEnv('CI', '');
    Object.assign(state, {
      isRegistered: true,
      previewActions: [CREATE_ACTION],
      registrationError: undefined,
      installError: undefined,
      uploadTargetsStatus: undefined,
      completeError: undefined,
      syncError: undefined,
      syncResponseOverride: undefined,
      failingUploadFileId: undefined,
      hasInvalidFirstUploadUrl: false,
      heldUploadFileId: undefined,
      wasSnapshotPresentDuringHeldUpload: undefined,
      isSyncHeld: false,
      heldSyncResponse: undefined,
      wasSnapshotPresentAtSync: undefined,
      snapshotPath: join(appPath, '.twenty', 'cli', 'snapshots', 'build-test'),
      workspaceResponse: undefined,
      exportResponse: undefined,
      exportStatus: undefined,
      isExportHeld: false,
      heldExportResponse: undefined,
      schemaResponse: undefined,
      schemaError: undefined,
      isSchemaHeld: false,
      heldSchemaResponse: undefined,
    });
    server.requests.length = 0;
  });

  afterEach(() => {
    state.heldSyncResponse?.end();
    state.heldExportResponse?.end();
    state.heldSchemaResponse?.end();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  afterAll(() => server.close());

  it.each([true, false])(
    'previews, installs, uploads without credentials, then syncs with deletion inference %s',
    async (inferDeletion) => {
      const { envelope, exitCode } = await runJson(
        ...(inferDeletion ? [] : ['--no-delete']),
      );

      expect(exitCode).toBe(0);
      expect(envelope.data).toMatchObject({
        application: APPLICATION,
        inferDeletionFromMissingEntities: inferDeletion,
        registrationCreated: false,
        completedPhases: [
          'build',
          'preview',
          'installation',
          'upload',
          'sync',
          'pullBase',
        ],
        actions: [CREATE_ACTION],
        summary: { create: 1, update: 0, delete: 0, destructive: 0 },
        upload: { fileCount: 2, byteCount: 40 },
        clientGeneration: 'skipped',
      });
      expect(envelope.warnings).toEqual([
        expect.objectContaining({ code: 'CLIENT_NOT_GENERATED' }),
      ]);
      expect(operations()).toEqual([
        'preview',
        'installation',
        'upload-targets',
        'put',
        'put',
        'upload-complete',
        'sync',
        'workspace',
        'export',
      ]);

      const [preview, , uploadTargets] = server.requests;
      const sync = server.requests.find(
        (request) => getOperation(request) === 'sync',
      );

      expect(readGraphqlRequest(preview).arguments).toMatchObject({
        manifest: MANIFEST,
        inferDeletionFromMissingEntities: inferDeletion,
      });
      expect(isDefined(sync) && readGraphqlRequest(sync)).toMatchObject({
        query: expect.not.stringContaining('dryRun'),
        arguments: {
          manifest: MANIFEST,
          inferDeletionFromMissingEntities: inferDeletion,
        },
      });
      expect(readGraphqlRequest(uploadTargets).arguments).toMatchObject({
        applicationUniversalIdentifier: APPLICATION.universalIdentifier,
        files: [
          {
            fileFolder: 'BuiltLogicFunction',
            filePath: 'logic-functions/hello.mjs',
            size: 29,
          },
          { fileFolder: 'PublicAsset', filePath: 'public/logo.svg', size: 11 },
        ],
      });

      const puts = server.requests.filter(
        (request) => request.method === 'PUT',
      );

      expect(puts.map((request) => request.body).sort()).toEqual(
        FILES.map((file) => file.content).sort(),
      );
      expect(
        puts.every((request) => !isDefined(request.headers.authorization)),
      ).toBe(true);
      expect(state.wasSnapshotPresentAtSync).toBe(true);
      expect(await readReleasedBuildId()).toBe('build-id');
      expect(existsSync(state.snapshotPath)).toBe(false);
    },
  );

  it('accepts the lowercase identifier the server returns for an uppercase manifest identifier', async () => {
    await writeTooling({
      application: {
        ...APPLICATION,
        universalIdentifier: APPLICATION.universalIdentifier.toUpperCase(),
      },
    });

    const { exitCode } = await runJson();

    expect(exitCode).toBe(0);
    expect(operations().at(-1)).toBe('export');
  });

  it('records the fresh remote export without changing the legacy base or local source', async () => {
    const legacyBasePath = join(appPath, '.twenty', 'pull-base.json');
    const sourcePath = join(appPath, 'application.ts');
    await mkdir(join(appPath, '.twenty'), { recursive: true });
    await writeFile(legacyBasePath, 'legacy baseline');
    await writeFile(sourcePath, 'unrelated local edits');
    vi.stubEnv('TWENTY_API_URL', `${server.url}/`);

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(0);
    expect(envelope.data.pullBase).toBe('recorded');
    expect(
      JSON.parse(
        await readFile(join(appPath, '.twenty/cli/pull-base.json'), 'utf8'),
      ),
    ).toEqual({
      version: 2,
      target: { apiUrl: server.url, workspaceId: WORKSPACE_ID },
      applicationUniversalIdentifier: APPLICATION.universalIdentifier,
      manifest: EXPORTED_MANIFEST,
      sourceFingerprints: {
        'application.ts': createHash('sha256')
          .update('unrelated local edits')
          .digest('hex'),
      },
    });
    expect(await readFile(legacyBasePath, 'utf8')).toBe('legacy baseline');
    expect(await readFile(sourcePath, 'utf8')).toBe('unrelated local edits');
    const exportRequest = server.requests.find(
      (request) => getOperation(request) === 'export',
    );
    expect(exportRequest?.headers.authorization).toBe('Bearer apply-test-key');
    expect(
      exportRequest && readGraphqlRequest(exportRequest).arguments,
    ).toEqual({
      universalIdentifier: APPLICATION.universalIdentifier,
    });
    expect((await readdir(join(appPath, '.twenty/cli'))).sort()).toEqual([
      'pull-base.json',
      'snapshots',
    ]);
  });

  it('fingerprints the source files as they were built, not as edited during the build', async () => {
    await mkdir(join(appPath, 'src'), { recursive: true });
    await writeFile(join(appPath, 'src/role.ts'), 'applied role');
    await mkdir(join(appPath, 'locales'), { recursive: true });
    await writeFile(join(appPath, 'locales/fr-FR.json'), '{"Pet":"Animal"}');
    await writeTooling({
      editDuringBuild: {
        relativePath: 'src/role.ts',
        content: 'edited during the build',
      },
    });

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(0);
    expect(envelope.data.pullBase).toBe('recorded');
    expect(
      JSON.parse(
        await readFile(join(appPath, '.twenty/cli/pull-base.json'), 'utf8'),
      ).sourceFingerprints,
    ).toEqual({
      'locales/fr-FR.json': createHash('sha256')
        .update('{"Pet":"Animal"}')
        .digest('hex'),
      'src/role.ts': createHash('sha256').update('applied role').digest('hex'),
    });
    expect(await readFile(join(appPath, 'src/role.ts'), 'utf8')).toBe(
      'edited during the build',
    );
  });

  it.each([
    ['missing workspace', { data: { currentWorkspace: null } }, undefined],
    [
      'invalid workspace UUID',
      { data: { currentWorkspace: { id: 'not-a-uuid' } } },
      undefined,
    ],
    [
      'non-object application manifest',
      undefined,
      {
        data: {
          exportApplication: {
            ...APPLICATION_EXPORT,
            manifest: { ...EXPORTED_MANIFEST, application: null },
          },
        },
      },
    ],
    ['missing export', undefined, { data: { exportApplication: null } }],
    [
      'wrong app',
      undefined,
      {
        data: {
          exportApplication: {
            ...APPLICATION_EXPORT,
            application: {
              ...APPLICATION_EXPORT.application,
              universalIdentifier: WORKSPACE_ID,
            },
          },
        },
      },
    ],
    [
      'wrong manifest',
      undefined,
      {
        data: {
          exportApplication: {
            ...APPLICATION_EXPORT,
            manifest: {
              ...EXPORTED_MANIFEST,
              application: {
                ...APPLICATION,
                universalIdentifier: WORKSPACE_ID,
              },
            },
          },
        },
      },
    ],
    [
      'non-object manifest',
      undefined,
      {
        data: {
          exportApplication: { ...APPLICATION_EXPORT, manifest: null },
        },
      },
    ],
    [
      'non-string coverage status',
      undefined,
      {
        data: {
          exportApplication: {
            ...APPLICATION_EXPORT,
            coverage: [
              {
                metadataName: 'object',
                universalIdentifier: WORKSPACE_ID,
                status: null,
                reason: null,
              },
            ],
          },
        },
      },
    ],
  ])(
    'preserves the previous base after a successful sync and %s',
    async (_description, workspaceResponse, exportResponse) => {
      const basePath = join(appPath, '.twenty/cli/pull-base.json');
      await mkdir(join(appPath, '.twenty/cli'), { recursive: true });
      await writeFile(basePath, 'previous baseline');
      state.workspaceResponse = workspaceResponse;
      state.exportResponse = exportResponse;
      await enableClientGeneration(
        'return { success: true, data: null, diagnostics: [] };',
      );

      const { envelope, exitCode } = await runJson();

      expect(exitCode).toBe(0);
      expect(envelope.data).toMatchObject({
        pullBase: 'failed',
        clientGeneration: 'generated',
      });
      expect(envelope.data.completedPhases).not.toContain('pullBase');
      expect(envelope.warnings).toEqual([
        expect.objectContaining({ code: 'PULL_BASE_NOT_RECORDED' }),
      ]);
      expect(await readFile(basePath, 'utf8')).toBe('previous baseline');
      expect(operations()).toContain('schema');
    },
  );

  it('refuses source exports before changing the base', async () => {
    state.exportResponse = {
      data: {
        exportApplication: {
          ...APPLICATION_EXPORT,
          files: [
            {
              folder: 'Source',
              path: 'application.ts',
              content: 'export default {};',
            },
          ],
        },
      },
    };

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(0);
    expect(envelope.data.pullBase).toBe('failed');
    expect(envelope.warnings).toContainEqual(
      expect.objectContaining({ code: 'PULL_BASE_NOT_RECORDED' }),
    );
    expect(existsSync(join(appPath, '.twenty/cli/pull-base.json'))).toBe(false);
    expect(await readdir(join(appPath, '.twenty/cli/snapshots'))).toEqual([]);
  });

  it('keeps permission failures separate from an unapplied app', async () => {
    state.exportResponse = graphqlError('FORBIDDEN');

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(0);
    expect(envelope.data.pullBase).toBe('failed');
    expect(envelope.warnings).toContainEqual(
      expect.objectContaining({ code: 'PULL_BASE_NOT_RECORDED' }),
    );
    expect(existsSync(join(appPath, '.twenty/cli/pull-base.json'))).toBe(false);
    expect(await readdir(join(appPath, '.twenty/cli/snapshots'))).toEqual([]);
  });

  it.each(['.twenty', '.twenty/cli', '.twenty/cli/pull-base.json'])(
    'does not follow a symlink at %s while recording the base',
    async (relativePath) => {
      const externalPath = await mkdtemp(
        join(tmpdir(), 'twenty-external-base-'),
      );
      const destination = join(appPath, relativePath);
      const isFile = relativePath.endsWith('.json');
      const target = isFile ? join(externalPath, 'base.json') : externalPath;
      if (isFile) {
        await writeFile(target, 'external baseline');
      }
      await mkdir(join(destination, '..'), { recursive: true });
      await symlink(target, destination);

      try {
        const { envelope, exitCode } = await runJson();

        expect(exitCode).toBe(0);
        expect(envelope.data.pullBase).toBe('failed');
        expect(envelope.warnings).toContainEqual(
          expect.objectContaining({ code: 'PULL_BASE_NOT_RECORDED' }),
        );
        expect(await readdir(externalPath)).toEqual(
          isFile
            ? ['base.json']
            : relativePath === '.twenty'
              ? ['cli']
              : ['snapshots'],
        );
        if (isFile) {
          expect(await readFile(target, 'utf8')).toBe('external baseline');
        }
      } finally {
        await rm(externalPath, { recursive: true, force: true });
      }
    },
  );

  it('cleans up staged files when the base cannot be replaced', async () => {
    const basePath = join(appPath, '.twenty/cli/pull-base.json');
    await mkdir(basePath, { recursive: true });
    await writeFile(join(basePath, 'keep.txt'), 'user contents');

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(0);
    expect(envelope.data.pullBase).toBe('failed');
    expect(envelope.warnings).toContainEqual(
      expect.objectContaining({ code: 'PULL_BASE_NOT_RECORDED' }),
    );
    expect(await readFile(join(basePath, 'keep.txt'), 'utf8')).toBe(
      'user contents',
    );
    expect((await readdir(join(appPath, '.twenty/cli'))).sort()).toEqual([
      'pull-base.json',
      'snapshots',
    ]);
  });

  it.each([
    ['missing collections', MANIFEST],
    [
      'null collections',
      { ...EXPORTED_MANIFEST, settingsMenuItems: null, objects: null },
    ],
    [
      'new collections',
      { ...EXPORTED_MANIFEST, futureCollection: [{ name: 'preserved' }] },
    ],
  ])(
    'records %s exactly as the server sent them',
    async (_description, manifest) => {
      state.exportResponse = {
        data: { exportApplication: { ...APPLICATION_EXPORT, manifest } },
      };

      const { envelope, exitCode } = await runJson();

      expect(exitCode).toBe(0);
      expect(envelope.data.pullBase).toBe('recorded');
      expect(
        JSON.parse(
          await readFile(join(appPath, '.twenty/cli/pull-base.json'), 'utf8'),
        ).manifest,
      ).toEqual(manifest);
    },
  );

  it('records a baseline when the server adds a coverage status', async () => {
    state.exportResponse = {
      data: {
        exportApplication: {
          ...APPLICATION_EXPORT,
          coverage: [
            {
              metadataName: 'object',
              universalIdentifier: WORKSPACE_ID,
              status: 'FUTURE_STATUS',
              reason: null,
            },
          ],
        },
      },
    };

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(0);
    expect(envelope.data.pullBase).toBe('recorded');
    expect(envelope.warnings).not.toContainEqual(
      expect.objectContaining({ code: 'PULL_BASE_NOT_RECORDED' }),
    );
  });

  it.each([
    [
      400,
      undefined,
      'Cannot query field "exportApplication" on type "Query".',
      'unsupported',
    ],
    [
      400,
      undefined,
      'Cannot query field "exportApplication" on type "Query". Did you mean "application"?',
      'unsupported',
    ],
    [
      200,
      'GRAPHQL_VALIDATION_FAILED',
      'Cannot query field "exportApplication" on type "Query".',
      'unsupported',
    ],
    [
      200,
      'GRAPHQL_VALIDATION_FAILED',
      'Cannot query field "exportApplication" on type "Query". Did you mean "application"?',
      'unsupported',
    ],
    [
      200,
      'GRAPHQL_VALIDATION_FAILED',
      'Cannot query field "coverage" on type "ApplicationExport".',
      'failed',
    ],
    [
      400,
      undefined,
      'Cannot query field "coverage" on type "ApplicationExport".',
      'failed',
    ],
    [
      200,
      undefined,
      'Cannot query field "exportApplication" on type "Query".',
      'failed',
    ],
    [
      400,
      'INTERNAL_SERVER_ERROR',
      'Cannot query field "exportApplication" on type "Query".',
      'failed',
    ],
  ])(
    'classifies only a missing export API as unsupported: %s %s %s',
    async (httpStatus, code, message, status) => {
      const basePath = join(appPath, '.twenty/cli/pull-base.json');
      await mkdir(join(appPath, '.twenty/cli'), { recursive: true });
      await writeFile(basePath, 'previous baseline');
      state.exportStatus = httpStatus;
      state.exportResponse = {
        errors: [
          {
            message,
            locations: [{ line: 1, column: 27 }],
            ...(isDefined(code) ? { extensions: { code } } : {}),
          },
        ],
      };
      await enableClientGeneration(
        'return { success: true, data: null, diagnostics: [] };',
      );

      const { envelope, exitCode } = await runJson();

      expect(exitCode).toBe(0);
      expect(envelope.data).toMatchObject({
        pullBase: status,
        clientGeneration: 'generated',
      });
      expect(envelope.data.completedPhases).not.toContain('pullBase');
      expect(envelope.warnings).toEqual(
        status === 'unsupported'
          ? []
          : [expect.objectContaining({ code: 'PULL_BASE_NOT_RECORDED' })],
      );
      expect(await readFile(basePath, 'utf8')).toBe('previous baseline');
    },
  );

  it('does not mistake an execution error for a missing export API', async () => {
    state.exportStatus = 400;
    state.exportResponse = {
      errors: [
        {
          message: 'Cannot query field "exportApplication" on type "Query".',
          path: ['exportApplication'],
        },
      ],
    };

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(0);
    expect(envelope.data.pullBase).toBe('failed');
    expect(envelope.warnings).toContainEqual(
      expect.objectContaining({ code: 'PULL_BASE_NOT_RECORDED' }),
    );
  });

  it('keeps a generation failure distinct from an earlier baseline warning', async () => {
    state.exportResponse = graphqlError('FORBIDDEN');
    await enableClientGeneration("throw new Error('generation failed');");

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(1);
    expect(envelope.error.details).toMatchObject({
      phase: 'clientGeneration',
      outcome: 'applied',
    });
    expect(envelope.error.details.completedPhases).not.toContain('pullBase');
    expect(envelope.warnings).toEqual([
      expect.objectContaining({ code: 'PULL_BASE_NOT_RECORDED' }),
    ]);
  });

  it('reports an applied app if export fetching is cancelled and preserves the base', async () => {
    const basePath = join(appPath, '.twenty/cli/pull-base.json');
    await mkdir(join(appPath, '.twenty/cli'), { recursive: true });
    await writeFile(basePath, 'previous baseline');
    state.isExportHeld = true;
    const pending = runJson();
    await vi.waitFor(() => expect(state.heldExportResponse).toBeDefined(), {
      timeout: 10_000,
    });
    process.emit('SIGINT');

    const { envelope, exitCode } = await pending;

    expect(exitCode).toBe(130);
    expect(envelope.error).toMatchObject({
      code: 'CANCELLED',
      details: { phase: 'pullBase', outcome: 'applied' },
    });
    expect(await readFile(basePath, 'utf8')).toBe('previous baseline');
    expect(operations()).not.toContain('schema');
  });

  it('generates with the project SDK after sync and snapshot release, keeping target credentials in the CLI', async () => {
    await enableClientGeneration(`
      fs.writeFileSync(path.join(appPath, 'generated.json'), JSON.stringify({
        appPath, schema,
        hasSignal: signal instanceof AbortSignal,
        snapshotReleased: fs.existsSync(path.join(__dirname, 'released.txt')),
        apiKey: process.env.TWENTY_API_KEY ?? null,
        apiUrl: process.env.TWENTY_API_URL ?? null,
      }));
      console.log('generator progress');
      return { success: true, data: null, diagnostics: [] };
    `);

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(0);
    expect(envelope.data).toMatchObject({
      clientGeneration: 'generated',
      completedPhases: [
        'build',
        'preview',
        'installation',
        'upload',
        'sync',
        'pullBase',
        'clientGeneration',
      ],
      diagnostics: expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining('generator progress'),
        }),
      ]),
    });
    expect(envelope.warnings).toEqual([]);
    expect(operations().slice(-4)).toEqual([
      'sync',
      'workspace',
      'export',
      'schema',
    ]);
    expect(
      operations().filter((operation) => operation === 'sync'),
    ).toHaveLength(1);
    const schemaRequest = server.requests.at(-1);

    expect(schemaRequest).toMatchObject({
      path: '/metadata',
      headers: { authorization: 'Bearer apply-test-key' },
    });
    expect(
      isDefined(schemaRequest) && readGraphqlRequest(schemaRequest).arguments,
    ).toEqual({
      applicationUniversalIdentifier: APPLICATION.universalIdentifier,
    });
    expect(
      JSON.parse(await readFile(join(appPath, 'generated.json'), 'utf8')),
    ).toEqual({
      appPath,
      schema: SCHEMA,
      hasSignal: true,
      snapshotReleased: true,
      apiKey: null,
      apiUrl: null,
    });
  });

  it('fetches the schema with the lowercase identifier the server acknowledged', async () => {
    await enableClientGeneration(
      'return { success: true, data: null, diagnostics: [] };',
      {
        ...APPLICATION,
        universalIdentifier: APPLICATION.universalIdentifier.toUpperCase(),
      },
    );

    const { envelope, exitCode } = await runJson();
    const schemaRequest = server.requests.at(-1);

    expect(exitCode).toBe(0);
    expect(envelope.data.clientGeneration).toBe('generated');
    expect(
      isDefined(schemaRequest) && readGraphqlRequest(schemaRequest).arguments,
    ).toEqual({
      applicationUniversalIdentifier: APPLICATION.universalIdentifier,
    });
  });

  it('skips generation with a warning when the app has no client package of its own', async () => {
    await enableClientGeneration(
      "throw new Error('generation must not start');",
    );
    await rm(join(appPath, 'node_modules', 'twenty-client-sdk'), {
      recursive: true,
    });

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(0);
    expect(envelope.data).toMatchObject({
      clientGeneration: 'skipped',
      completedPhases: [
        'build',
        'preview',
        'installation',
        'upload',
        'sync',
        'pullBase',
      ],
    });
    expect(envelope.warnings).toEqual([
      {
        code: 'CLIENT_NOT_GENERATED',
        message: expect.stringContaining(
          "twenty-client-sdk is not installed in the app's own node_modules",
        ),
      },
    ]);
    expect(operations()).not.toContain('schema');
  });

  it('leaves a dangling client package link to the client generator instead of skipping generation', async () => {
    await enableClientGeneration(`
      if (!fs.existsSync(path.join(appPath, 'node_modules', 'twenty-client-sdk', 'package.json'))) {
        return { success: false, error: { code: 'CLIENT_GENERATION_FAILED', message: 'twenty-client-sdk is unreadable.' }, diagnostics: [] };
      }
      return { success: true, data: null, diagnostics: [] };
    `);
    await rm(join(appPath, 'node_modules', 'twenty-client-sdk'), {
      recursive: true,
    });
    await symlink(
      join(appPath, 'missing-client-sdk'),
      join(appPath, 'node_modules', 'twenty-client-sdk'),
    );

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'CLIENT_GENERATION_FAILED',
      message: `Apply App was applied to ${server.url}, but its typed API client was not regenerated: twenty-client-sdk is unreadable.`,
      details: { phase: 'clientGeneration', outcome: 'applied' },
    });
    expect(operations()).toContain('schema');
  });

  it('prints successful local client generation in the human summary', async () => {
    await enableClientGeneration(
      'return { success: true, data: null, diagnostics: [] };',
    );

    const { exitCode, stdout, stderr } = await run();

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Regenerated the typed API client.');
    expect(stderr).not.toContain('typed API client was not regenerated');
  });

  it.each([
    null,
    {},
    { applicationCoreGraphqlSchema: '' },
    { applicationCoreGraphqlSchema: '   ' },
    { applicationCoreGraphqlSchema: 42 },
  ])(
    'keeps the remote sync completed when the schema response is unreadable: %j',
    async (data) => {
      await enableClientGeneration(
        "throw new Error('generation must not start');",
      );
      state.schemaResponse = { data };

      const { exitCode, envelope } = await runJson();

      expect(exitCode).toBe(1);
      expect(envelope.error).toMatchObject({
        code: 'INVALID_RESPONSE',
        details: {
          phase: 'clientGeneration',
          outcome: 'applied',
          completedPhases: [
            'build',
            'preview',
            'installation',
            'upload',
            'sync',
            'pullBase',
          ],
        },
      });
    },
  );

  it('does not classify a schema permission failure as an unapplied app', async () => {
    await enableClientGeneration();
    state.schemaError = 'FORBIDDEN';

    const { exitCode, envelope } = await runJson();

    expect(exitCode).toBe(3);
    expect(envelope.error).toMatchObject({
      code: 'PERMISSION_DENIED',
      message: expect.stringContaining(
        `Apply App was applied to ${server.url}, but its typed API client was not regenerated`,
      ),
      hint: expect.stringContaining('already has this version of the app'),
      details: {
        phase: 'clientGeneration',
        outcome: 'applied',
        completedPhases: expect.arrayContaining(['sync']),
      },
    });
  });

  it.each([
    { body: undefined, code: 'WORKER_FAILED' },
    { body: 'process.exit(7);', code: 'WORKER_FAILED' },
    {
      body: 'return { success: true, data: {}, diagnostics: [] };',
      code: 'WORKER_FAILED',
    },
    {
      body: `
      fs.writeFileSync(path.join(appPath, 'partial-client.txt'), 'partial');
      return { success: false, error: { code: 'CLIENT_GENERATION_FAILED', message: 'Write failed.' }, diagnostics: [{ severity: 'error', code: 'GENERATE', message: 'Write failed.' }] };
    `,
      code: 'CLIENT_GENERATION_FAILED',
    },
  ])(
    'preserves the sync when generation fails with $code',
    async ({ body, code }) => {
      await enableClientGeneration(body);

      const { exitCode, envelope } = await runJson();

      expect(exitCode).toBe(1);
      expect(envelope.error).toMatchObject({
        code,
        details: {
          phase: 'clientGeneration',
          outcome: 'applied',
          completedPhases: expect.arrayContaining(['sync']),
        },
        hint: expect.stringContaining('may be incomplete'),
      });
      expect(envelope.error.details.completedPhases).not.toContain(
        'clientGeneration',
      );
      expect(await readReleasedBuildId()).toBe('build-id');
      expect(
        operations().filter((operation) => operation === 'sync'),
      ).toHaveLength(1);
    },
  );

  it('never fetches a schema or generates a client after a failed sync', async () => {
    await enableClientGeneration(
      "throw new Error('generation must not start');",
    );
    state.syncError = 'INTERNAL_SERVER_ERROR';

    const { exitCode, envelope } = await runJson();

    expect(exitCode).toBe(1);
    expect(envelope.error.details).toMatchObject({
      phase: 'sync',
      outcome: 'unknown',
    });
    expect(operations()).not.toContain('schema');
  });

  it('keeps the remote sync completed when schema fetching is cancelled', async () => {
    await enableClientGeneration();
    state.isSchemaHeld = true;
    const pending = runJson();

    await vi.waitFor(() => expect(state.heldSchemaResponse).toBeDefined(), {
      timeout: 10_000,
    });
    process.emit('SIGINT');

    const { exitCode, envelope } = await pending;

    expect(exitCode).toBe(130);
    expect(envelope.error).toMatchObject({
      code: 'CANCELLED',
      message: `Apply App was applied to ${server.url}, but generating its typed API client was cancelled.`,
      details: {
        phase: 'clientGeneration',
        outcome: 'applied',
        completedPhases: expect.arrayContaining(['sync']),
      },
    });
  });

  it.each(['CANCELLED', 'CLIENT_GENERATION_FAILED'])(
    'waits for generation to settle and preserves the SDK result %s after cancellation',
    async (code) => {
      await enableClientGeneration(`
      fs.writeFileSync(path.join(appPath, 'generation-started.txt'), 'started');
      await new Promise((resolve) => signal.addEventListener('abort', resolve, { once: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));
      fs.writeFileSync(path.join(appPath, 'generation-settled.txt'), 'settled');
      return { success: false, error: { code: '${code}', message: 'Generation stopped.' }, diagnostics: [] };
    `);
      const pending = runJson();

      await vi.waitFor(
        () =>
          expect(existsSync(join(appPath, 'generation-started.txt'))).toBe(
            true,
          ),
        { timeout: 10_000 },
      );
      process.emit('SIGINT');

      const { exitCode, envelope } = await pending;

      expect(exitCode).toBe(code === 'CANCELLED' ? 130 : 1);
      expect(envelope.error).toMatchObject({
        code,
        details: {
          phase: 'clientGeneration',
          outcome: 'applied',
          completedPhases: expect.arrayContaining(['sync']),
        },
      });
      expect(
        await readFile(join(appPath, 'generation-settled.txt'), 'utf8'),
      ).toBe('settled');
    },
  );

  it('terminates an unresponsive generator on cancellation while preserving the completed sync', async () => {
    await enableClientGeneration(`
      fs.writeFileSync(path.join(appPath, 'generation-started.txt'), 'started');
      setInterval(() => {}, 1000);
      await new Promise(() => {});
    `);
    const pending = runJson();

    await vi.waitFor(
      () =>
        expect(existsSync(join(appPath, 'generation-started.txt'))).toBe(true),
      { timeout: 10_000 },
    );
    process.emit('SIGINT');

    const { exitCode, envelope } = await pending;

    expect(exitCode).toBe(130);
    expect(envelope.error).toMatchObject({
      code: 'CANCELLED',
      details: {
        phase: 'clientGeneration',
        outcome: 'applied',
        completedPhases: expect.arrayContaining(['sync']),
      },
    });
  }, 15_000);

  it('refuses to register an unknown app without --create', async () => {
    state.isRegistered = false;

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(2);
    expect(envelope.error).toMatchObject({
      code: 'CREATE_REQUIRED',
      hint: expect.stringContaining('--create'),
      details: {
        phase: 'confirmation',
        outcome: 'not-started',
        completedPhases: ['build'],
      },
    });
    expect(operations()).toEqual(['preview']);
    expect(await readReleasedBuildId()).toBe('build-id');
  });

  it('registers, installs and previews an unknown app with --create before uploading', async () => {
    state.isRegistered = false;

    const { envelope, exitCode } = await runJson('--create');

    expect(exitCode).toBe(0);
    expect(envelope.data).toMatchObject({
      registrationCreated: true,
      completedPhases: [
        'build',
        'registration',
        'installation',
        'preview',
        'upload',
        'sync',
        'pullBase',
      ],
    });
    expect(operations()).toEqual([
      'preview',
      'registration',
      'installation',
      'preview',
      'upload-targets',
      'put',
      'put',
      'upload-complete',
      'sync',
      'workspace',
      'export',
    ]);
    expect(server.requests[1].body).not.toContain('clientSecret');
  });

  it('keeps a completed registration in the report when a later step fails', async () => {
    state.isRegistered = false;
    state.installError = 'FORBIDDEN';

    const { envelope, exitCode } = await runJson('--create');

    expect(exitCode).toBe(3);
    expect(envelope.error).toMatchObject({
      code: 'PERMISSION_DENIED',
      details: {
        phase: 'installation',
        outcome: 'not-started',
        completedPhases: ['build', 'registration'],
      },
    });
    expect(operations()).toEqual(['preview', 'registration', 'installation']);
  });

  it.each([
    [
      'registration',
      { isRegistered: false, registrationError: 'INTERNAL_SERVER_ERROR' },
      ['--create'],
      'GRAPHQL_ERROR',
      ['build'],
    ],
    [
      'installation',
      { installError: 'INTERNAL_SERVER_ERROR' },
      [],
      'GRAPHQL_ERROR',
      ['build', 'preview'],
    ],
    [
      'upload',
      { uploadTargetsStatus: 500 },
      [],
      'HTTP_ERROR',
      ['build', 'preview', 'installation'],
    ],
  ])(
    'reports an unknown outcome when the server fails a %s request after receiving it',
    async (phase, serverState, args, code, completedPhases) => {
      Object.assign(state, serverState);

      const { envelope, exitCode } = await runJson(...args);

      expect(exitCode).toBe(1);
      expect(envelope.error).toMatchObject({
        code,
        details: { phase, outcome: 'unknown', completedPhases },
      });
      expect(operations()).not.toContain('sync');
    },
  );

  it('requires --yes before deleting objects or fields in automation', async () => {
    state.previewActions = [CREATE_ACTION, OBJECT_DELETION];

    const refused = await runJson();

    expect(refused.exitCode).toBe(2);
    expect(refused.envelope.error).toMatchObject({
      code: 'CONFIRMATION_REQUIRED',
      message:
        'The plan includes 1 object or field deletion that permanently deletes stored data.',
      hint: expect.stringContaining('--yes'),
      details: { phase: 'confirmation', completedPhases: ['build', 'preview'] },
    });
    expect(operations()).toEqual(['preview']);

    server.requests.length = 0;

    const approved = await runJson('--yes');

    expect(approved.exitCode).toBe(0);
    expect(approved.envelope.data.summary).toMatchObject({
      delete: 1,
      destructive: 1,
    });
    expect(operations().at(-1)).toBe('export');
  });

  it.each([
    ['y\n', 0, 'export'],
    ['n\n', 2, 'preview'],
  ])(
    'asks before deleting objects in an interactive terminal (answer %j)',
    async (answer, expectedExitCode, lastOperation) => {
      state.previewActions = [OBJECT_DELETION];
      vi.spyOn(process, 'stdin', 'get').mockReturnValue(
        createStandardInputStub({ content: answer, isTerminal: true }),
      );

      const { exitCode, stderr } = await run();

      expect(exitCode).toBe(expectedExitCode);
      expect(stderr).toContain(
        'Warning: 1 destructive change(s) will permanently delete data.',
      );
      expect(stderr).toContain(
        '  - objectMetadata "invoice": drops the table and all its rows',
      );
      expect(operations().at(-1)).toBe(lastOperation);
    },
  );

  it('reports a partial upload and never syncs', async () => {
    state.failingUploadFileId = 'file-1';

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'UPLOAD_FAILED',
      details: {
        phase: 'upload',
        outcome: 'partial',
        completedPhases: ['build', 'preview', 'installation'],
        failures: [
          { path: 'public/logo.svg', message: 'File storage answered 500.' },
        ],
      },
    });
    expect(operations()).not.toContain('sync');
    expect(await readReleasedBuildId()).toBe('build-id');
  });

  it('waits for uploads in flight before releasing the snapshot after an upload error', async () => {
    state.hasInvalidFirstUploadUrl = true;
    state.heldUploadFileId = 'file-1';

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'INVALID_RESPONSE',
      details: {
        phase: 'upload',
        outcome: 'unknown',
        completedPhases: ['build', 'preview', 'installation'],
      },
    });
    expect(state.wasSnapshotPresentDuringHeldUpload).toBe(true);
    expect(operations()).not.toContain('upload-complete');
    expect(operations()).not.toContain('sync');
    expect(await readReleasedBuildId()).toBe('build-id');
  });

  it('does not claim an untouched workspace once upload targets exist', async () => {
    state.completeError = 'FORBIDDEN';

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(3);
    expect(envelope.error).toMatchObject({
      code: 'PERMISSION_DENIED',
      details: { phase: 'upload', outcome: 'unknown' },
    });
    expect(operations()).not.toContain('sync');
  });

  it('refuses a snapshot file that changed after the build before uploading', async () => {
    await writeTooling({ corruptPath: 'public/logo.svg' });

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'SNAPSHOT_INVALID',
      details: { phase: 'upload', outcome: 'not-started' },
    });
    expect(operations()).toEqual(['preview', 'installation']);
  });

  it('keeps an existing base unchanged while planning or after an unacknowledged sync', async () => {
    const basePath = join(appPath, '.twenty/cli/pull-base.json');
    await mkdir(join(appPath, '.twenty/cli'), { recursive: true });
    await writeFile(basePath, 'previous baseline');
    const plan = await runCliForTest([
      'app',
      'plan',
      '--path',
      appPath,
      '--json',
    ]);

    expect(plan.exitCode).toBe(0);
    expect(await readFile(basePath, 'utf8')).toBe('previous baseline');
    expect(operations()).not.toContain('export');
    state.syncResponseOverride = { data: null };

    const { exitCode } = await runJson();

    expect(exitCode).toBe(1);
    expect(await readFile(basePath, 'utf8')).toBe('previous baseline');
    expect(operations()).not.toContain('export');
    expect(operations()).not.toContain('workspace');
  });

  it('reports an unknown outcome when the sync fails', async () => {
    state.syncError = 'BAD_USER_INPUT';

    const { envelope, exitCode } = await runJson();

    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'GRAPHQL_ERROR',
      hint: expect.stringContaining('twenty app plan'),
      details: {
        phase: 'sync',
        outcome: 'unknown',
        completedPhases: ['build', 'preview', 'installation', 'upload'],
      },
    });
    expect(await readReleasedBuildId()).toBe('build-id');
  });

  it.each([
    ['no result', { data: null }],
    ['an empty result', { data: {} }],
    [
      'the wrong application',
      {
        data: {
          syncApplication: {
            applicationUniversalIdentifier: 'another-app',
            actions: [],
          },
        },
      },
    ],
  ])(
    'never reports an applied app when the sync answers with %s',
    async (_description, response) => {
      state.syncResponseOverride = response;

      const { envelope, exitCode, stdout } = await runJson();

      expect(exitCode).toBe(1);
      expect(envelope.error).toMatchObject({
        code: 'INVALID_RESPONSE',
        details: { phase: 'sync', outcome: 'unknown' },
      });
      expect(stdout).not.toContain('Applied');
    },
  );

  it('keeps variable values from a failed sync out of the error', async () => {
    state.syncResponseOverride = {
      data: {
        syncApplication: {
          applicationUniversalIdentifier: APPLICATION.universalIdentifier,
          actions: [
            {
              type: 'create',
              metadataName: 'applicationVariable',
              flatEntity: { name: 'API_TOKEN', value: 'super-secret' },
            },
          ],
        },
      },
      errors: [
        { message: 'Partial failure.', extensions: { code: 'BAD_USER_INPUT' } },
      ],
    };

    const { envelope, exitCode, stdout } = await runJson();

    expect(exitCode).toBe(1);
    expect(envelope.error).toMatchObject({
      code: 'GRAPHQL_ERROR',
      details: { phase: 'sync', outcome: 'unknown', data: null },
    });
    expect(stdout).not.toContain('super-secret');
  });

  it('exits with 130 and an unknown sync outcome when cancelled during the sync', async () => {
    state.isSyncHeld = true;

    const pending = runJson();

    await vi.waitFor(() => expect(operations()).toContain('sync'), {
      timeout: 10_000,
    });
    process.emit('SIGINT');

    const { envelope, exitCode } = await pending;

    expect(exitCode).toBe(130);
    expect(envelope.error).toMatchObject({
      code: 'CANCELLED',
      details: { phase: 'sync', outcome: 'unknown' },
    });
    expect(await readReleasedBuildId()).toBe('build-id');
  });

  it('prints the plan on stderr and a summary on stdout', async () => {
    const { stdout, stderr, exitCode } = await run();

    expect(exitCode).toBe(0);
    expect(stderr).toContain(`Computing metadata plan on ${server.url}…`);
    expect(stderr).toContain('Plan: 1 to add, 0 to change, 0 to destroy.');
    expect(stderr).toContain('typed API client was not regenerated');
    expect(stdout).toContain(`Applied Apply App to ${server.url}`);
    expect(stdout).toContain('2 files uploaded (40 B)');
  });

  it('lists the command as a write with its permissions', async () => {
    const { stdout } = await runCliForTest(['commands', '--json']);
    const commands: unknown = parseSingleJsonLine(stdout).data.commands;

    expect(commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'app apply',
          writes: true,
          needsProject: true,
          needsTarget: true,
          requiredPermissions: ['APPLICATIONS', 'UPLOAD_FILE'],
        }),
      ]),
    );
  });
});
