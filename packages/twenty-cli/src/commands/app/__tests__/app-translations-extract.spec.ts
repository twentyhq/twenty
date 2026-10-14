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

import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { buildTestAppWorker } from '@/app/__tests__/utils/build-test-app-worker';

const worker = vi.hoisted(() => ({ modulePath: '', execArgv: [] as string[] }));
vi.mock('@/app/get-app-worker-launch', () => ({
  getAppWorkerLaunch: () => worker,
}));

const REPOSITORY_ROOT = fileURLToPath(
  new URL('../../../../../../', import.meta.url),
);

describe('app translations extract', () => {
  let workerDirectory: string;
  let appPath: string;
  const run = (args: string[] = []) =>
    runCliForTest(['app', 'translations', 'extract', ...args]);

  beforeAll(async () => {
    workerDirectory = await mkdtemp(
      join(tmpdir(), 'twenty-translation-worker-'),
    );
    await buildTestAppWorker(workerDirectory);
    worker.modulePath = join(workerDirectory, 'app-worker.cjs');
  }, 60_000);
  afterAll(() => rm(workerDirectory, { recursive: true, force: true }));

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-translation-app-'));
    await cp(
      join(REPOSITORY_ROOT, 'packages/twenty-apps/fixtures/minimal-app'),
      appPath,
      {
        recursive: true,
        filter: (source) =>
          !source
            .split('/')
            .some((part) => ['node_modules', '.twenty', 'dist'].includes(part)),
      },
    );
    await symlink(
      join(REPOSITORY_ROOT, 'node_modules'),
      join(appPath, 'node_modules'),
    );
    vi.spyOn(process, 'cwd').mockReturnValue(appPath);
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(appPath, { recursive: true, force: true });
  });

  it('runs the real worker offline, emits JSON, scaffolds a locale and extracts front-component messages', async () => {
    const componentPath = join(appPath, 'my.front-component.tsx');
    const source = await readFile(componentPath, 'utf8');
    await writeFile(
      componentPath,
      source.replace('<h2>My Component</h2>', '<h2>{t("Welcome")}</h2>'),
    );
    const result = await run(['--locale', 'fr-FR', '--json']);
    expect(result.exitCode, result.stdout + result.stderr).toBe(0);
    const envelope = parseSingleJsonLine(result.stdout);
    expect(envelope.data).toMatchObject({
      app: { name: 'minimal-app', path: appPath },
      updatedLocaleFiles: ['locales/en.json', 'locales/fr-FR.json'],
    });
    expect(
      JSON.parse(await readFile(join(appPath, 'locales/en.json'), 'utf8')),
    ).toMatchObject({
      Welcome: 'Welcome',
      'objectMetadata.labelSingular': { 'My note': 'My note' },
    });
    expect(
      JSON.parse(await readFile(join(appPath, 'locales/fr-FR.json'), 'utf8')),
    ).toMatchObject({ Welcome: '' });
    expect(await readdir(appPath)).not.toContain('dist');
  }, 30_000);

  it('discovers the containing app from a nested directory and honors --path', async () => {
    const nested = join(appPath, 'src/nested');
    await mkdir(nested, { recursive: true });
    vi.spyOn(process, 'cwd').mockReturnValue(nested);
    const result = await run();
    expect(result.exitCode, result.stderr).toBe(0);
    expect(result.stdout).toContain('strings to locales/');
    vi.spyOn(process, 'cwd').mockReturnValue(tmpdir());
    expect((await run(['--path', appPath])).exitCode).toBe(0);
  }, 30_000);

  it.each(['en', 'fr', '../outside', 'constructor'])(
    'rejects locale %s before loading app source',
    async (locale) => {
      await writeFile(
        join(appPath, 'application.config.ts'),
        'throw new Error("must not load");',
      );
      const result = await run(['--locale', locale, '--json']);
      expect(result.exitCode).toBe(2);
      expect(parseSingleJsonLine(result.stdout).error.code).toBe('USAGE');
      expect(await readdir(appPath)).not.toContain('locales');
    },
  );

  it('reports manifest validation errors without writing catalogs', async () => {
    await writeFile(
      join(appPath, 'application.config.ts'),
      'throw new Error("bad app definition");',
    );
    const result = await run(['--json']);
    expect(result.exitCode).toBe(1);
    expect(parseSingleJsonLine(result.stdout).error.code).toBe('BUILD_FAILED');
    expect(await readdir(appPath)).not.toContain('locales');
  }, 30_000);

  it('surfaces malformed existing catalogs without overwriting them', async () => {
    await mkdir(join(appPath, 'locales'));
    await writeFile(join(appPath, 'locales/fr-FR.json'), '{');
    const result = await run(['--json']);
    expect(result.exitCode).toBe(1);
    expect(parseSingleJsonLine(result.stdout).error).toMatchObject({
      code: 'INVALID_INPUT',
      message: expect.stringContaining('Cannot read translation catalog'),
    });
    expect(await readdir(join(appPath, 'locales'))).toEqual(['fr-FR.json']);
    expect(await readFile(join(appPath, 'locales/fr-FR.json'), 'utf8')).toBe(
      '{',
    );
  }, 30_000);

  it('reports an unsafe catalog path as APP_PATH_UNAVAILABLE', async () => {
    const outside = join(appPath, 'outside');
    await mkdir(outside);
    await symlink(outside, join(appPath, 'locales'));

    const result = await run(['--json']);

    expect(result.exitCode).toBe(1);
    expect(parseSingleJsonLine(result.stdout).error).toMatchObject({
      code: 'APP_PATH_UNAVAILABLE',
      message: expect.stringContaining('Cannot follow symbolic links'),
    });
    expect(await readdir(outside)).toEqual([]);
  }, 30_000);

  it('advertises extraction in topic help and machine-readable command discovery', async () => {
    const help = await runCliForTest(['app', 'translations', '--help']);
    expect(help.stdout).toContain('extract');
    const commands = await runCliForTest(['commands', '--json']);
    expect(commands.stdout).toContain(
      'Extract app strings and update translation catalogs',
    );
  });
});
