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
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build as bundle, stop } from 'esbuild';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { buildTestAppWorker } from '@/app/__tests__/utils/build-test-app-worker';
import { SORTED_GLOB_PLUGIN } from '@/app/__tests__/utils/sorted-glob-plugin';
import { buildAndValidateManifest } from '@/app/manifest/build-and-validate-manifest';
import { buildManifest } from '@/app/manifest/manifest-build';
import { createAppProject } from '@/app/create-app-project';
import { runAppWorker } from '@/app/run-app-worker';
import { type compileApplicationTranslations } from '@/app/translations/compile-application-translations';

const launch = vi.hoisted(() => ({ modulePath: '', execArgv: [] as string[] }));

vi.mock('@/app/get-app-worker-launch', () => ({
  getAppWorkerLaunch: () => launch,
}));
vi.mock('@/app/get-app-template-directory', () => ({
  getAppTemplateDirectory: () =>
    join(REPOSITORY_ROOT, 'packages/create-twenty-app/src/constants/template'),
}));
vi.mock('@/app/get-app-template-overlay-directory', () => ({
  getAppTemplateOverlayDirectory: () =>
    join(REPOSITORY_ROOT, 'packages/twenty-cli/app-template-overlay'),
}));

const REPOSITORY_ROOT = fileURLToPath(
  new URL('../../../../../../', import.meta.url),
);
const FIXTURES_DIRECTORY = join(
  REPOSITORY_ROOT,
  'packages/twenty-apps/fixtures',
);
const FIXTURES = [
  'minimal-app',
  'rich-app',
  'function-execute-app',
  'shared-dependencies-app',
  'invalid-app',
];

type SdkReference = {
  buildManifest: typeof buildManifest;
  buildAndValidateManifest: typeof buildAndValidateManifest;
  compileApplicationTranslations: typeof compileApplicationTranslations;
};

const json = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe('CLI manifest parity with the repository SDK', () => {
  let root: string;
  let sdk: SdkReference;

  const copyFixture = async (name: string) => {
    const appPath = await mkdtemp(join(root, `${name}-`));

    await cp(join(FIXTURES_DIRECTORY, name), appPath, {
      recursive: true,
      filter: (source) =>
        !source
          .split('/')
          .some((part) => ['node_modules', '.twenty', 'dist'].includes(part)),
    });
    await symlink(join(root, 'node_modules'), join(appPath, 'node_modules'));

    return appPath;
  };

  const compareManifest = async (appPath: string) => {
    const expected = await sdk
      .buildAndValidateManifest(appPath)
      .catch((error: unknown) => ({
        thrown: error instanceof Error ? error.message : String(error),
      }));

    if ('thrown' in expected) {
      await expect(buildAndValidateManifest(appPath)).rejects.toThrow(
        expected.thrown,
      );
      const worker = await runAppWorker({
        request: { type: 'buildManifest', appPath },
        signal: new AbortController().signal,
      });

      expect(worker.result).toMatchObject({
        success: false,
        error: { code: 'MANIFEST_BUILD_FAILED', message: expected.thrown },
      });

      return { success: false as const, errors: [expected.thrown] };
    }

    const actual = await buildAndValidateManifest(appPath);

    expect(json(actual)).toEqual(json(expected));
    expect(json(await buildManifest(appPath))).toEqual(
      json(await sdk.buildManifest(appPath)),
    );

    const warnings: string[] = [];
    const translations = expected.success
      ? await sdk.compileApplicationTranslations({
          appPath,
          onWarning: (message) => warnings.push(message),
        })
      : undefined;
    const worker = await runAppWorker({
      request: { type: 'buildManifest', appPath },
      signal: new AbortController().signal,
    });

    expect(worker.isSnapshotHeld).toBe(false);
    expect(worker.result).toEqual(
      json(
        expected.success
          ? {
              success: true,
              data: {
                manifest: { ...expected.manifest, translations },
                filePaths: expected.filePaths,
              },
              diagnostics: [...expected.warnings, ...warnings].map(
                (message) => ({
                  severity: 'warning',
                  code: 'BUILD_WARNING',
                  message,
                }),
              ),
            }
          : {
              success: false,
              error: {
                code: 'MANIFEST_BUILD_FAILED',
                message: expected.errors.join('\n'),
              },
              diagnostics: expected.errors.map((message) => ({
                severity: 'error',
                code: 'MANIFEST_BUILD_FAILED',
                message,
              })),
            },
      ),
    );

    return actual;
  };

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'twenty-manifest-parity-'));
    const modules = join(root, 'node_modules');
    const sdkPath = join(modules, 'twenty-sdk');
    const sourceSdk = join(REPOSITORY_ROOT, 'packages/twenty-sdk');
    const sdkRequire = createRequire(join(sourceSdk, 'package.json'));

    await mkdir(join(modules, '@sniptt'), { recursive: true });

    for (const name of [
      'react',
      'react-dom',
      '@sniptt/guards',
      'uuid',
      'esbuild',
      'typescript',
      'tinyglobby',
      'twenty-shared',
      'twenty-client-sdk',
      'twenty-ui',
    ]) {
      await symlink(
        name === 'uuid'
          ? dirname(sdkRequire.resolve('uuid/package.json'))
          : join(REPOSITORY_ROOT, 'node_modules', name),
        join(modules, name),
      );
    }

    const packageJson = JSON.parse(
      await readFile(join(sourceSdk, 'package.json'), 'utf8'),
    );
    const exports: Record<string, unknown> = {};

    for (const name of [
      'define',
      'front-component',
      'logic-function',
      'billing',
      'utils',
    ]) {
      await cp(join(sourceSdk, 'dist', name), join(sdkPath, 'dist', name), {
        recursive: true,
      });
      exports[`./${name}`] = packageJson.exports[`./${name}`];
    }

    await writeFile(
      join(sdkPath, 'package.json'),
      JSON.stringify({
        name: packageJson.name,
        version: packageJson.version,
        engines: packageJson.engines,
        exports,
      }),
    );
    expect(() =>
      createRequire(join(root, 'package.json')).resolve('twenty-sdk/build'),
    ).toThrow();

    const oraclePath = join(root, 'sdk-reference.cjs');
    const sdkSource = join(sourceSdk, 'src');

    await bundle({
      stdin: {
        contents: `export { buildManifest } from './cli/utilities/build/manifest/manifest-build';
export { buildAndValidateManifest } from './cli/utilities/build/manifest/build-and-validate-manifest';
export { compileApplicationTranslations } from './cli/utilities/translations/compile-application-translations';`,
        resolveDir: sdkSource,
      },
      outfile: oraclePath,
      alias: { '@': sdkSource },
      bundle: true,
      packages: 'external',
      platform: 'node',
      format: 'cjs',
      target: 'node24',
      plugins: [SORTED_GLOB_PLUGIN],
    });
    sdk = createRequire(import.meta.url)(oraclePath) as SdkReference;

    await buildTestAppWorker(join(root, 'cli'));
    launch.modulePath = join(root, 'cli/app-worker.cjs');
  }, 60000);

  afterEach(() => vi.unstubAllEnvs());
  afterAll(async () => {
    await stop();
    await rm(root, { recursive: true, force: true });
  });

  it('covers every repository fixture', async () => {
    expect(
      (await readdir(FIXTURES_DIRECTORY, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort(),
    ).toEqual([...FIXTURES].sort());
  });

  it.each(FIXTURES)(
    'matches the manifest, file paths, errors and warnings for %s',
    async (name) => {
      const result = await compareManifest(await copyFixture(name));

      expect(result.success).toBe(name !== 'invalid-app');
    },
    60000,
  );

  it('matches a freshly initialized app and its server requirement', async () => {
    const appPath = join(root, 'fresh-app');

    await createAppProject({
      appDirectory: appPath,
      appName: 'fresh-app',
      appDisplayName: 'Fresh app',
      appDescription: 'Parity fixture',
      signal: new AbortController().signal,
    });
    await symlink(join(root, 'node_modules'), join(appPath, 'node_modules'));
    const result = await compareManifest(appPath);
    const packageJson = JSON.parse(
      await readFile(join(appPath, 'package.json'), 'utf8'),
    );

    expect(result.success).toBe(true);
    if (result.success)
      expect(result.manifest.application.requiredServerVersionRange).toBe(
        packageJson.engines.twenty,
      );
  }, 60000);

  it('matches authored and compiled translations and malformed catalog warnings', async () => {
    const appPath = await copyFixture('minimal-app');

    await mkdir(join(appPath, 'locales/compiled'), { recursive: true });
    await writeFile(
      join(appPath, 'locales/fr-FR.json'),
      JSON.stringify({
        Company: 'Entreprise',
        door: { Open: 'Ouvrir' },
        Empty: '',
      }),
    );
    await writeFile(
      join(appPath, 'locales/compiled/fr-FR.json'),
      JSON.stringify({ orphan: 'Conservé' }),
    );
    await writeFile(join(appPath, 'locales/de-DE.json'), '{');
    await writeFile(join(appPath, 'locales/klingon.json'), '{}');
    await compareManifest(appPath);
  }, 60000);

  it('matches duplicate identifier diagnostics and empty lockfile failures', async () => {
    const appPath = await copyFixture('minimal-app');
    const duplicate = join(appPath, 'duplicate.role.ts');

    await cp(join(appPath, 'my.role.ts'), duplicate);
    const duplicateResult = await compareManifest(appPath);

    expect(duplicateResult.success).toBe(false);
    if (!duplicateResult.success)
      expect(duplicateResult.errors.join('\n')).toContain(
        'Duplicate universal identifiers',
      );

    await rm(duplicate);
    await writeFile(join(appPath, 'yarn.lock'), '');
    const lockResult = await compareManifest(appPath);

    expect(lockResult).toEqual({
      success: false,
      errors: [
        'yarn.lock is empty. Run "yarn install" to regenerate it before building.',
      ],
    });
  }, 60000);

  it('keeps evaluated source output and workspace credentials outside the manifest result', async () => {
    const appPath = await copyFixture('minimal-app');
    const applicationFiles = (await buildManifest(appPath)).filePaths
      .application;
    const filePath = join(appPath, applicationFiles[0]);

    await writeFile(
      filePath,
      `console.log('manifest source output');
if (process.env.TWENTY_API_KEY) throw new Error('workspace credential leaked');
${await readFile(filePath, 'utf8')}`,
    );
    vi.stubEnv('TWENTY_API_KEY', 'must-not-reach-app');
    const worker = await runAppWorker({
      request: { type: 'buildManifest', appPath },
      signal: new AbortController().signal,
    });

    expect(worker.result).toMatchObject({ success: true });
    expect(JSON.stringify(worker.output)).toContain('manifest source output');
    expect(JSON.stringify(worker.result)).not.toContain(
      'manifest source output',
    );
  }, 60000);
});
