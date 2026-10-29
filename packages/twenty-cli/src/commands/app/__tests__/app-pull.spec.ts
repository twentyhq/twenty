import {
  access,
  appendFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createStandardInputStub } from '@/__tests__/utils/create-standard-input-stub';
import { getAppTemplateDirectory } from '@/app/get-app-template-directory';
import { installAppDependenciesOrThrow } from '@/app/install-app-dependencies-or-throw';
import { promptInTerminal } from '@/input/prompt-in-terminal';
import { CliError } from '@/output/cli-error';
import { MetadataWritability } from 'twenty-shared/types';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
import { readGraphqlRequest } from '@/__tests__/utils/read-graphql-request';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';

const launch = vi.hoisted(() => ({ modulePath: '', execArgv: [] as string[] }));
vi.mock('@/app/get-app-worker-launch', () => ({
  getAppWorkerLaunch: () => launch,
}));
vi.mock('@/app/get-app-template-directory', () => ({
  getAppTemplateDirectory: vi.fn(),
}));
vi.mock('@/app/install-app-dependencies-or-throw', () => ({
  installAppDependenciesOrThrow: vi.fn(),
}));
vi.mock('@/input/prompt-in-terminal', () => ({ promptInTerminal: vi.fn() }));
const TEMPLATE_DIRECTORY = fileURLToPath(
  new URL('../../../../app-template', import.meta.url),
);
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
let customApplication: { universalIdentifier: string } | null = {
  universalIdentifier: SOURCE_TEST_APPLICATION_ID,
};
const server = await startTestServer((request, response) => {
  if (request.body.includes('currentWorkspace')) {
    return sendJson(response, 200, {
      data: {
        currentWorkspace: {
          id: WORKSPACE_ID,
          workspaceCustomApplication: customApplication,
        },
      },
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
    vi.mocked(getAppTemplateDirectory).mockReturnValue(TEMPLATE_DIRECTORY);
    vi.mocked(promptInTerminal).mockReset();
    vi.mocked(installAppDependenciesOrThrow)
      .mockReset()
      .mockImplementation(async ({ appPath }) => {
        const packageJson = await readFile(
          join(appPath, 'package.json'),
          'utf8',
        );
        await createSourceTestApp(appPath);
        await writeFile(join(appPath, 'package.json'), packageJson);
      });
    appPath = await mkdtemp(join(tmpdir(), 'twenty-cli-pull-'));
    sdkPath = await createSourceTestApp(appPath);
    await writeFile(join(appPath, 'app.ts'), sourceApplication());
    exported = createExport();
    forbidden = false;
    customApplication = { universalIdentifier: SOURCE_TEST_APPLICATION_ID };
    server.requests.length = 0;
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', 'must-not-reach-source');
    vi.stubEnv('TWENTY_REMOTE', '');
    vi.stubEnv('CI', 'true');
  });
  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
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

  it.each([true, false])(
    'pulls dependencies and keeps the app usable with an exported SDK dependency: %s',
    async (hasSdk) => {
      const packageJson = JSON.stringify({
        name: 'pulled-app',
        dependencies: {
          ...(hasSdk ? { 'twenty-sdk': '2.44.0' } : {}),
          lodash: '4.17.21',
        },
      });
      exported.files = [
        { folder: 'dependencies', path: 'package.json', content: packageJson },
        { folder: 'dependencies', path: 'yarn.lock', content: 'remote-lock' },
      ];

      const first = await runJson();
      expect(first.exitCode, JSON.stringify(first.envelope)).toBe(0);
      expect(
        server.requests
          .filter((request) => request.body.includes('exportApplication'))
          .map((request) => readGraphqlRequest(request).arguments),
      ).toEqual([
        {
          universalIdentifier: SOURCE_TEST_APPLICATION_ID,
          shouldIncludeDependencies: true,
        },
      ]);
      const pulledPackageJson = await readFile(
        join(appPath, 'package.json'),
        'utf8',
      );
      expect(JSON.parse(pulledPackageJson).dependencies).toEqual({
        'twenty-sdk': '2.44.0',
        lodash: '4.17.21',
      });
      if (hasSdk) {
        expect(pulledPackageJson).toBe(packageJson);
      }
      expect(await readFile(join(appPath, 'yarn.lock'), 'utf8')).toBe(
        'remote-lock',
      );
      expect(first.envelope.data.writes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'dependency',
            relativePath: 'package.json',
          }),
          expect.objectContaining({
            kind: 'dependency',
            relativePath: 'yarn.lock',
          }),
        ]),
      );
      expect(JSON.stringify(first.envelope.data)).not.toContain('remote-lock');

      await writeFile(join(appPath, 'yarn.lock'), 'local-lock');
      const localPackageJson = JSON.stringify({
        ...JSON.parse(pulledPackageJson),
        description: 'local edit',
      });
      await writeFile(join(appPath, 'package.json'), localPackageJson);
      const repeated = await runJson();
      expect(repeated.exitCode, JSON.stringify(repeated.envelope)).toBe(0);
      expect(repeated.envelope.data.writes).toEqual([]);
      expect(await readFile(join(appPath, 'package.json'), 'utf8')).toBe(
        localPackageJson,
      );
      expect(await readFile(join(appPath, 'yarn.lock'), 'utf8')).toBe(
        'local-lock',
      );

      exported.files[1].content = 'updated-remote-lock';
      const changed = await runJson();
      expect(changed.exitCode, JSON.stringify(changed.envelope)).toBe(0);
      expect(await readFile(join(appPath, 'yarn.lock'), 'utf8')).toBe(
        'updated-remote-lock',
      );
      expect(changed.envelope.data.overwrittenLocalChanges).toContainEqual({
        universalIdentifier: 'dependencies/yarn.lock',
        relativePath: 'yarn.lock',
      });

      await rm(join(appPath, 'yarn.lock'));
      expect((await runJson()).exitCode).toBe(0);
      expect(await readFile(join(appPath, 'yarn.lock'), 'utf8')).toBe(
        'updated-remote-lock',
      );

      exported.files[0].content = JSON.stringify({
        ...JSON.parse(packageJson),
        description: 'remote edit',
      });
      const packageChanged = await runJson();
      expect(
        packageChanged.exitCode,
        JSON.stringify(packageChanged.envelope),
      ).toBe(0);
      expect(
        JSON.parse(await readFile(join(appPath, 'package.json'), 'utf8')),
      ).toMatchObject({
        description: 'remote edit',
        dependencies: { 'twenty-sdk': '2.44.0' },
      });
      expect(
        packageChanged.envelope.data.overwrittenLocalChanges,
      ).toContainEqual({
        universalIdentifier: 'dependencies/package.json',
        relativePath: 'package.json',
      });
    },
    30_000,
  );

  it.each([
    'source',
    'public-asset',
    'files-field',
    'email-attachment',
    'agent-chat',
  ])(
    'rejects exported %s files without changing dependencies or metadata',
    async (folder) => {
      const originalPackageJson = await readFile(
        join(appPath, 'package.json'),
        'utf8',
      );
      exported.files = [
        { folder: 'dependencies', path: 'package.json', content: '{}' },
        { folder, path: 'package.json', content: 'private data' },
      ];
      expect((await runJson()).envelope.error.code).toBe('TOOLING_UNSUPPORTED');
      expect(await readFile(join(appPath, 'package.json'), 'utf8')).toBe(
        originalPackageJson,
      );
      expect((await readdir(appPath)).sort()).toEqual([
        'app.ts',
        'node_modules',
        'package.json',
      ]);
    },
  );

  it('refuses a dependency symlink before writing either dependency file', async () => {
    const outsidePath = `${appPath}-outside.lock`;
    const originalPackageJson = await readFile(
      join(appPath, 'package.json'),
      'utf8',
    );
    await writeFile(outsidePath, 'outside-lock');
    await symlink(outsidePath, join(appPath, 'yarn.lock'));
    exported.files = [
      { folder: 'dependencies', path: 'package.json', content: '{}' },
      { folder: 'dependencies', path: 'yarn.lock', content: 'remote-lock' },
    ];
    try {
      const result = await runJson();
      expect(result.exitCode).not.toBe(0);
      expect(result.envelope.error.message).toContain('symbolic links');
      expect(await readFile(outsidePath, 'utf8')).toBe('outside-lock');
      expect(await readFile(join(appPath, 'package.json'), 'utf8')).toBe(
        originalPackageJson,
      );
      expect((await readdir(appPath)).sort()).toEqual([
        'app.ts',
        'node_modules',
        'package.json',
        'yarn.lock',
      ]);
    } finally {
      await rm(outsidePath, { force: true });
    }
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

  it('pulls the workspace custom application without an identifier or local definition', async () => {
    await rm(join(appPath, 'app.ts'));
    const result = await runJson();

    expect(result.exitCode, JSON.stringify(result.envelope)).toBe(0);
    expect(result.envelope.data.application.universalIdentifier).toBe(
      SOURCE_TEST_APPLICATION_ID,
    );
    expect(readGraphqlRequest(server.requests[0]).query).toContain(
      'workspaceCustomApplication',
    );
    expect(readGraphqlRequest(server.requests[1]).arguments).toEqual({
      universalIdentifier: SOURCE_TEST_APPLICATION_ID,
      shouldIncludeDependencies: true,
    });
    expect(
      await readFile(join(appPath, 'src/application.config.ts'), 'utf8'),
    ).toContain(SOURCE_TEST_APPLICATION_ID);
  });

  it.each([null, { universalIdentifier: OBJECT_ID }])(
    'uses the locally declared application when the workspace custom application is %j',
    async (customApplicationValue) => {
      customApplication = customApplicationValue;
      const result = await runJson();

      expect(result.exitCode, JSON.stringify(result.envelope)).toBe(0);
      expect(readGraphqlRequest(server.requests[0]).query).not.toContain(
        'workspaceCustomApplication',
      );
      expect(readGraphqlRequest(server.requests[1]).arguments).toEqual({
        universalIdentifier: SOURCE_TEST_APPLICATION_ID,
        shouldIncludeDependencies: true,
      });
      expect(installAppDependenciesOrThrow).not.toHaveBeenCalled();
      expect(promptInTerminal).not.toHaveBeenCalled();
    },
  );

  it('fails without creating a project when the custom application is missing', async () => {
    await rm(appPath, { recursive: true });
    customApplication = null;
    const result = await runJson('--yes');

    expect(result.envelope.error).toMatchObject({
      code: 'APP_NOT_FOUND',
      message: 'This workspace has no custom application to pull.',
    });
    expect(server.requests).toHaveLength(1);
    await expect(stat(appPath)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(installAppDependenciesOrThrow).not.toHaveBeenCalled();
  });

  it('rejects a malformed workspace custom application identifier before export', async () => {
    await rm(join(appPath, 'app.ts'));
    customApplication = { universalIdentifier: 'not-a-uuid' };

    expect((await runJson()).envelope.error.code).toBe('INVALID_RESPONSE');
    expect(server.requests).toHaveLength(1);
    expect(await readdir(appPath)).not.toContain('.twenty');
  });

  it('rejects the removed identifier option before contacting the workspace', async () => {
    expect((await runJson('--universal-identifier', OBJECT_ID)).exitCode).toBe(
      2,
    );
    expect(server.requests).toHaveLength(0);
  });

  it('creates and pulls a clean project into a new directory with --yes', async () => {
    await rm(appPath, { recursive: true });
    const result = await runJson('--yes');

    expect(result.exitCode, JSON.stringify(result.envelope)).toBe(0);
    expect(result.envelope.data.pulled).toBe(true);
    expect(installAppDependenciesOrThrow).toHaveBeenCalledOnce();
    expect(promptInTerminal).not.toHaveBeenCalled();
    expect(await readdir(join(appPath, 'src'))).toEqual([
      'application.config.ts',
      'objects',
    ]);
    expect(
      await readFile(join(appPath, 'src/application.config.ts'), 'utf8'),
    ).toContain(SOURCE_TEST_APPLICATION_ID);
    expect(
      await readFile(join(appPath, 'src/objects/pet.object.ts'), 'utf8'),
    ).toContain(OBJECT_ID);
    expect(
      JSON.parse(await readFile(join(appPath, 'package.json'), 'utf8')).scripts
        .typecheck,
    ).toBe('tsgo --noEmit -p tsconfig.json');
    expect(await readdir(appPath)).not.toContain('public');
    const second = await runJson();
    expect(second.exitCode, JSON.stringify(second.envelope)).toBe(0);
    expect(second.envelope.data.base.status).toBe('used');
    expect(installAppDependenciesOrThrow).toHaveBeenCalledOnce();
  });

  it('asks for the directory and confirmation outside an app', async () => {
    await rm(appPath, { recursive: true });
    await mkdir(appPath);
    vi.spyOn(process, 'cwd').mockReturnValue(appPath);
    vi.stubEnv('CI', 'false');
    vi.spyOn(process, 'stdin', 'get').mockReturnValue(
      createStandardInputStub({ isTerminal: true }),
    );
    vi.mocked(promptInTerminal)
      .mockResolvedValueOnce('workspace-app')
      .mockResolvedValueOnce('yes');

    const result = await runCliForTest(['app', 'pull']);

    expect(result.exitCode, result.stderr).toBe(0);
    expect(promptInTerminal).toHaveBeenCalledTimes(2);
    expect(vi.mocked(promptInTerminal).mock.calls[1][0].question).toContain(
      'install its dependencies',
    );
    expect(await readdir(appPath)).toEqual(['workspace-app']);
    expect(
      await readFile(
        join(appPath, 'workspace-app/src/application.config.ts'),
        'utf8',
      ),
    ).toContain(SOURCE_TEST_APPLICATION_ID);
  });

  it('does not create anything when the user declines', async () => {
    await rm(appPath, { recursive: true });
    vi.stubEnv('CI', 'false');
    vi.spyOn(process, 'stdin', 'get').mockReturnValue(
      createStandardInputStub({ isTerminal: true }),
    );
    vi.mocked(promptInTerminal).mockResolvedValueOnce('no');

    const result = await run();

    expect(result.exitCode).toBe(2);
    expect(installAppDependenciesOrThrow).not.toHaveBeenCalled();
    await expect(stat(appPath)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('requires approval in noninteractive mode before creating files', async () => {
    await rm(appPath, { recursive: true });
    const result = await runJson('--no-input');

    expect(result.envelope.error.code).toBe('CONFIRMATION_REQUIRED');
    expect(promptInTerminal).not.toHaveBeenCalled();
    expect(installAppDependenciesOrThrow).not.toHaveBeenCalled();
    await expect(stat(appPath)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('requires a destination when creating without prompts', async () => {
    await rm(appPath, { recursive: true });
    await mkdir(appPath);
    vi.spyOn(process, 'cwd').mockReturnValue(appPath);

    const result = await runCliForTest(['app', 'pull', '--yes', '--json']);

    expect(parseSingleJsonLine(result.stdout).error.code).toBe(
      'APP_PATH_REQUIRED',
    );
    expect(await readdir(appPath)).toEqual([]);
    expect(installAppDependenciesOrThrow).not.toHaveBeenCalled();
  });

  it('preserves files in an unrelated nonempty directory', async () => {
    await rm(appPath, { recursive: true });
    await mkdir(appPath);
    await writeFile(join(appPath, 'notes.txt'), 'keep me');
    const result = await runJson('--yes');

    expect(result.envelope.error.code).toBe('APP_PATH_UNAVAILABLE');
    expect(await readdir(appPath)).toEqual(['notes.txt']);
    expect(await readFile(join(appPath, 'notes.txt'), 'utf8')).toBe('keep me');
    expect(installAppDependenciesOrThrow).not.toHaveBeenCalled();
  });

  it('does not write pulled definitions after an installation failure', async () => {
    await rm(appPath, { recursive: true });
    vi.mocked(installAppDependenciesOrThrow).mockRejectedValue(
      new CliError({ code: 'APP_INIT_FAILED', message: 'Yarn failed' }),
    );
    const result = await runJson('--yes');

    expect(result.envelope.error.code).toBe('APP_INIT_FAILED');
    expect(await readdir(appPath)).toContain('package.json');
    expect(await readdir(appPath)).not.toContain('src');
    expect(await readdir(appPath)).not.toContain('.twenty');
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

  it('rejects files outside the dependency folder before writes', async () => {
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
