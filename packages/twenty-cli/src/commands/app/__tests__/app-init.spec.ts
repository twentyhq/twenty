import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import type * as fileSystemPromises from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isDefined } from 'twenty-shared/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_TEMPLATE_PACKAGE_VERSION } from '@/app/constants/app-template-package-version.constant';
import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { getAppTemplateDirectory } from '@/app/get-app-template-directory';
import { CLI_VERSION } from '@/constants/cli-version.constant';

vi.mock('@/app/get-app-template-directory', () => ({
  getAppTemplateDirectory: vi.fn(),
}));

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof fileSystemPromises>();

  return { ...actual, copyFile: vi.fn(actual.copyFile) };
});

const TEMPLATE_DIRECTORY = fileURLToPath(
  new URL('../../../../app-template', import.meta.url),
);

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/g;

const LOGIN_STEP = 'twenty auth login --url <url>';

describe('app init', () => {
  let root: string;
  let workDirectory: string;

  const run = (args: string[]) => runCliForTest(['app', 'init', ...args]);
  const runJson = async (args: string[]) => {
    const result = await run([...args, '--json']);

    return { ...result, envelope: parseSingleJsonLine(result.stdout) };
  };
  const readUniversalIdentifiers = (appDirectory: string) =>
    readFile(
      join(appDirectory, 'src', 'constants', 'universal-identifiers.ts'),
      'utf8',
    );
  const readPackageJson = async (appDirectory: string) =>
    JSON.parse(await readFile(join(appDirectory, 'package.json'), 'utf8'));

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'twenty-app-init-'));
    workDirectory = join(root, 'work');
    await mkdir(join(root, 'home'));
    await mkdir(workDirectory);
    vi.mocked(getAppTemplateDirectory).mockReturnValue(TEMPLATE_DIRECTORY);
    vi.stubEnv('HOME', join(root, 'home'));
    vi.stubEnv('TWENTY_API_KEY', '');
    vi.stubEnv('TWENTY_API_URL', '');
    vi.stubEnv('TWENTY_REMOTE', '');
    vi.spyOn(process, 'cwd').mockReturnValue(workDirectory);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  it('creates the app from the bundled template without installing or saving anything', async () => {
    const result = await run(['my-app']);
    const appDirectory = join(workDirectory, 'my-app');

    expect(result.exitCode, result.stderr).toBe(0);
    expect(await readdir(workDirectory)).toEqual(['my-app']);
    expect(await readdir(appDirectory)).toEqual(
      expect.arrayContaining([
        '.github',
        '.gitignore',
        '.yarnrc.yml',
        'AGENTS.md',
        'CLAUDE.md',
        'package.json',
        'public',
        'src',
      ]),
    );
    expect(await readdir(appDirectory)).not.toContain('node_modules');
    expect(await readPackageJson(appDirectory)).toMatchObject({
      name: 'my-app',
      engines: {
        node: '^24.5.0',
        npm: 'please-use-yarn',
        twenty: `>=${APP_TEMPLATE_PACKAGE_VERSION}`,
        yarn: '>=4.0.2',
      },
      devDependencies: {
        'twenty-client-sdk': APP_TEMPLATE_PACKAGE_VERSION,
        'twenty-sdk': APP_TEMPLATE_PACKAGE_VERSION,
        'twenty-ui': APP_TEMPLATE_PACKAGE_VERSION,
      },
    });

    const universalIdentifiers = await readUniversalIdentifiers(appDirectory);
    const identifiers = universalIdentifiers.match(UUID_PATTERN) ?? [];

    expect(universalIdentifiers).toContain("APP_DISPLAY_NAME = 'My app'");
    expect(universalIdentifiers).not.toContain('TO-BE-GENERATED');
    expect(identifiers.length).toBeGreaterThan(1);
    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(result.stdout).toContain('Created my-app in my-app');

    for (const command of [
      'cd my-app',
      'yarn install',
      LOGIN_STEP,
      'twenty app apply --create',
    ]) {
      expect(result.stdout).toContain(command);
    }

    await expect(stat(join(root, 'home', '.twenty'))).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });

  it('writes an integration test setup that runs the globally installed CLI', async () => {
    const result = await run(['my-app']);
    const testsDirectory = join(workDirectory, 'my-app', 'src', '__tests__');

    expect(result.exitCode, result.stderr).toBe(0);

    const globalSetup = await readFile(
      join(testsDirectory, 'global-setup.ts'),
      'utf8',
    );

    expect(globalSetup).toContain("import { runTwenty } from './run-twenty';");
    expect(globalSetup).toContain("runTwenty(['app', 'apply', '--create'])");
    expect(globalSetup).not.toContain('twenty-sdk/cli');
    expect(await readFile(join(testsDirectory, 'run-twenty.ts'), 'utf8')).toBe(
      await readFile(
        join(TEMPLATE_DIRECTORY, 'src', '__tests__', 'run-twenty.ts'),
        'utf8',
      ),
    );
    expect((await readdir(testsDirectory)).sort()).toEqual([
      'application-config.test.ts',
      'global-setup.ts',
      'run-twenty.ts',
      'schema.integration-test.ts',
    ]);
  });

  it('installs the generating CLI version in CI before running integration tests', async () => {
    const result = await run(['my-app']);
    const workflow = await readFile(
      join(workDirectory, 'my-app', '.github', 'workflows', 'ci.yml'),
      'utf8',
    );
    const installCommand = `run: npm install -g twenty@${CLI_VERSION}`;

    expect(result.exitCode, result.stderr).toBe(0);
    expect(workflow).toContain(installCommand);
    expect(workflow).not.toContain('TO-BE-GENERATED');
    expect(workflow.indexOf(installCommand)).toBeGreaterThan(
      workflow.indexOf('uses: actions/setup-node@'),
    );
    expect(workflow.indexOf(installCommand)).toBeLessThan(
      workflow.indexOf('run: yarn test\n'),
    );
  });

  it('returns the app, its pins and the next steps as JSON, without a login step when a workspace is set', async () => {
    vi.stubEnv('TWENTY_API_URL', 'https://crm.example.com');
    vi.stubEnv('TWENTY_API_KEY', 'test-key');

    const result = await runJson([
      '@acme/billing',
      '--path',
      'apps/billing',
      '--description',
      'Invoices',
    ]);
    const appDirectory = join(workDirectory, 'apps', 'billing');

    expect(result.exitCode, result.stdout).toBe(0);
    expect(result.envelope.data).toEqual({
      app: {
        name: '@acme/billing',
        displayName: 'Acme billing',
        description: 'Invoices',
        path: appDirectory,
      },
      packages: [
        { name: 'twenty-client-sdk', version: APP_TEMPLATE_PACKAGE_VERSION },
        { name: 'twenty-sdk', version: APP_TEMPLATE_PACKAGE_VERSION },
        { name: 'twenty-ui', version: APP_TEMPLATE_PACKAGE_VERSION },
      ],
      nextSteps: [
        { command: 'cd apps/billing', description: 'Enter the new app' },
        {
          command: 'yarn install',
          description: 'Install the pinned dependencies',
        },
        {
          command: 'twenty app apply --create',
          description: 'Build the app and install it in your workspace',
        },
      ],
    });
    expect((await readPackageJson(appDirectory)).name).toBe('@acme/billing');
  });

  it('writes quotes and replacement patterns in the display name and description literally', async () => {
    const result = await run([
      'my-app',
      '--display-name',
      "Bob's app",
      '--description',
      'Costs $& more',
    ]);
    const universalIdentifiers = await readUniversalIdentifiers(
      join(workDirectory, 'my-app'),
    );

    expect(result.exitCode, result.stderr).toBe(0);
    expect(universalIdentifiers).toContain("APP_DISPLAY_NAME = 'Bob\\'s app'");
    expect(universalIdentifiers).toContain("APP_DESCRIPTION = 'Costs $& more'");
  });

  it('fills an existing empty directory in place, including the current one', async () => {
    const appDirectory = join(workDirectory, 'my-app');

    await mkdir(appDirectory);

    const { ino } = await stat(appDirectory);

    vi.spyOn(process, 'cwd').mockReturnValue(appDirectory);

    const result = await runJson(['my-app', '--path', '.']);

    expect(result.exitCode, result.stdout).toBe(0);
    expect((await stat(appDirectory)).ino).toBe(ino);
    expect(await readdir(appDirectory)).toContain('package.json');
    expect(await readdir(workDirectory)).toEqual(['my-app']);
    expect(
      result.envelope.data.nextSteps.map(
        ({ command }: { command: string }) => command,
      ),
    ).toEqual(['yarn install', LOGIN_STEP, 'twenty app apply --create']);
  });

  it('never overwrites a file that appears in the empty directory while the app is copied in', async () => {
    const appDirectory = join(workDirectory, 'my-app');
    const actualFileSystem =
      await vi.importActual<typeof fileSystemPromises>('node:fs/promises');
    let concurrentFile = '';

    await mkdir(appDirectory);
    vi.mocked(copyFile).mockImplementationOnce(
      async (source, destination, mode) => {
        concurrentFile = String(destination);
        await actualFileSystem.writeFile(
          destination,
          'concurrent user contents',
        );

        return actualFileSystem.copyFile(source, destination, mode);
      },
    );

    const result = await runJson(['my-app']);
    const remainingFiles = (
      await readdir(appDirectory, { recursive: true, withFileTypes: true })
    )
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name));

    expect(result.exitCode).toBe(1);
    expect(result.envelope.error.code).toBe('APP_INIT_FAILED');
    expect(remainingFiles).toEqual([concurrentFile]);
    expect(await readFile(concurrentFile, 'utf8')).toBe(
      'concurrent user contents',
    );
    expect(await readdir(workDirectory)).toEqual(['my-app']);
  });

  it.each([
    {
      title: 'a saved remote',
      config: {
        version: 1,
        defaultRemote: 'production',
        remotes: {
          production: { apiUrl: 'https://crm.example.com', apiKey: 'key' },
          staging: {
            apiUrl: 'https://staging.example.com',
            apiKey: 'staging-key',
          },
        },
      },
      expectedCommands: ['twenty app apply --create --remote staging'],
    },
    {
      title: 'a remote that is not saved yet',
      config: undefined,
      expectedCommands: [
        'twenty auth login --url <url> --name staging',
        'twenty app apply --create --remote staging',
      ],
    },
  ])(
    'points the next steps at $title passed with --remote',
    async ({ config, expectedCommands }) => {
      if (isDefined(config)) {
        await mkdir(join(root, 'home', '.twenty'));
        await writeFile(
          join(root, 'home', '.twenty', 'config.json'),
          JSON.stringify(config),
        );
      }

      const result = await runJson(['remote-app', '--remote', 'staging']);

      expect(result.exitCode, result.stdout).toBe(0);
      expect(
        result.envelope.data.nextSteps
          .map(({ command }: { command: string }) => command)
          .slice(2),
      ).toEqual(expectedCommands);
    },
  );

  it.each([
    {
      title: 'a directory with files',
      prepare: async (target: string) => {
        await mkdir(target);
        await writeFile(join(target, 'notes.md'), 'mine');
      },
      ownFile: (target: string) => join(target, 'notes.md'),
      reason: 'is not empty',
    },
    {
      title: 'a file',
      prepare: (target: string) => writeFile(target, 'mine'),
      ownFile: (target: string) => target,
      reason: 'is not a directory',
    },
  ])(
    'refuses to create the app over $title and leaves it untouched',
    async ({ prepare, ownFile, reason }) => {
      const target = join(workDirectory, 'my-app');

      await prepare(target);

      const result = await runJson(['my-app']);

      expect(result.exitCode).toBe(6);
      expect(result.envelope.error).toMatchObject({
        code: 'APP_PATH_UNAVAILABLE',
        message: `${target} already exists and ${reason}.`,
      });
      expect(await readFile(ownFile(target), 'utf8')).toBe('mine');
      expect(await readdir(workDirectory)).toEqual(['my-app']);
    },
  );

  it.each([
    'My App',
    '.hidden',
    '_private',
    'UPPER',
    'apps/billing',
    'node_modules',
    'favicon.ico',
  ])('rejects %s as a package name', async (name) => {
    const result = await runJson([name]);

    expect(result.exitCode).toBe(2);
    expect(result.envelope.error.code).toBe('INVALID_APP_NAME');
    expect(await readdir(workDirectory)).toEqual([]);
  });

  it('leaves nothing behind when the template cannot be copied', async () => {
    vi.mocked(getAppTemplateDirectory).mockReturnValue(
      join(root, 'missing-template'),
    );

    const result = await runJson(['my-app']);

    expect(result.exitCode).toBe(1);
    expect(result.envelope.error.code).toBe('APP_INIT_FAILED');
    expect(await readdir(workDirectory)).toEqual([]);
  });

  it('refuses a template it cannot fully render and leaves nothing behind', async () => {
    const template = join(root, 'template');

    await cp(TEMPLATE_DIRECTORY, template, { recursive: true });
    await writeFile(join(template, 'OWNERS.md'), 'Owner: TO-BE-GENERATED');
    vi.mocked(getAppTemplateDirectory).mockReturnValue(template);

    const result = await runJson(['my-app']);

    expect(result.exitCode).toBe(1);
    expect(result.envelope.error).toMatchObject({
      code: 'APP_INIT_FAILED',
      details: { unrenderedFiles: ['OWNERS.md'] },
    });
    expect(await readdir(workDirectory)).toEqual([]);
  });

  it('copies the template lockfile and leaves its root entry for yarn install to rename', async () => {
    const template = join(root, 'template');
    const lockfile =
      '"TO-BE-GENERATED@workspace:.":\n  version: 0.0.0-use.local\n  resolution: "TO-BE-GENERATED@workspace:."\n';

    await cp(TEMPLATE_DIRECTORY, template, { recursive: true });
    await writeFile(join(template, 'yarn.lock'), lockfile);
    vi.mocked(getAppTemplateDirectory).mockReturnValue(template);

    const result = await runJson(['my-app']);

    expect(result.exitCode).toBe(0);
    expect(
      await readFile(join(workDirectory, 'my-app', 'yarn.lock'), 'utf8'),
    ).toBe(lockfile);
  });
});
