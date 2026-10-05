import { createHash } from 'node:crypto';
import {
  cp,
  lstat,
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
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { build as bundle, stop } from 'esbuild';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { buildTestAppWorker } from '@/app/__tests__/utils/build-test-app-worker';
import { SORTED_GLOB_PLUGIN } from '@/app/__tests__/utils/sorted-glob-plugin';
import { createAppProject } from '@/app/create-app-project';
import { pathExists } from '@/app/fs-utils';
import { runAppWorker } from '@/app/run-app-worker';
import { buildSnapshot, releaseSnapshot } from '@/app/snapshots/build-snapshot';
import { type ToolingBuild } from '@/app/types/tooling-result.type';

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
const json = (value: unknown): unknown => JSON.parse(JSON.stringify(value));
const hash = (bytes: Buffer | string) =>
  createHash('sha256').update(bytes).digest('hex');
const requireDirectory = (build: ToolingBuild) => {
  if (!build.directory) throw new Error('Snapshot has no directory');
  return build.directory;
};
const compareDirectory = async (first: string, second: string) => {
  const entries = (
    await readdir(first, { recursive: true, withFileTypes: true })
  ).filter((entry) => entry.isFile());
  expect((await readdir(second, { recursive: true })).sort()).toEqual(
    (await readdir(first, { recursive: true })).sort(),
  );
  for (const entry of entries) {
    const path = join(entry.parentPath, entry.name).slice(first.length + 1);
    const expected = await readFile(join(first, path));
    const actual = await readFile(join(second, path));
    if (path.endsWith('.map')) {
      const normalize = (bytes: Buffer, directory: string) => {
        const map = JSON.parse(bytes.toString());
        map.sources = map.sources.map((source: string) =>
          /^[a-z-]+:/i.test(source)
            ? source
            : resolve(dirname(join(directory, path)), source),
        );
        map.sourcesContent = map.sourcesContent.map(
          (source: string, index: number) =>
            map.sources[index] ===
            'twenty-sdk-define-stub:__twenty-sdk-define-stub__'
              ? source.replace(
                  /^\/\/ Auto-generated stub for twenty-sdk\/define[^\r\n]*$/m,
                  '',
                )
              : source,
        );
        return map;
      };
      expect(normalize(actual, second), path).toEqual(
        normalize(expected, first),
      );
    } else {
      expect(actual.equals(expected), path).toBe(true);
    }
  }
};

describe('CLI bundles and snapshots match the repository SDK', () => {
  let root: string;
  let sdkEntryPath: string;
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

  const buildSdkSnapshot = async (
    appPath: string,
    useHeldSnapshot?: Parameters<typeof runAppWorker>[0]['useHeldSnapshot'],
  ) => {
    launch.modulePath = join(root, 'reference/app-worker.cjs');
    try {
      return await runAppWorker({
        request: { type: 'bundleSnapshot', appPath, holdSnapshot: true },
        signal: new AbortController().signal,
        useHeldSnapshot: async (snapshot) => {
          launch.modulePath = join(root, 'cli/app-worker.cjs');
          await useHeldSnapshot?.(snapshot);
        },
      });
    } finally {
      launch.modulePath = join(root, 'cli/app-worker.cjs');
    }
  };

  const compareSnapshot = async (appPath: string) => {
    const compareBuild = async ({ result }: { result: unknown }) => {
      const expected = result as Awaited<ReturnType<typeof buildSnapshot>>;
      const response = await runAppWorker({
        request: { type: 'bundleSnapshot', appPath, holdSnapshot: true },
        signal: new AbortController().signal,
        useHeldSnapshot: async ({ result }) => {
          expect(result).toMatchObject({ success: true });
          const actual = (result as { data: ToolingBuild }).data;
          if (!expected.success) throw new Error(JSON.stringify(expected));
          const directory = requireDirectory(actual);
          expect(directory).toContain('/.twenty/cli/snapshots/build-');
          expect(json({ ...actual, buildId: '', directory: '' })).toEqual(
            json({ ...expected.data, buildId: '', directory: '' }),
          );
          expect(
            JSON.parse(
              await readFile(join(dirname(directory), 'lease.json'), 'utf8'),
            ),
          ).toMatchObject({
            buildId: actual.buildId,
            pid: expect.any(Number),
            createdAt: expect.any(String),
          });
          for (const artifact of actual.files) {
            const bytes = await readFile(join(directory, artifact.path));
            expect(artifact.size).toBe(bytes.length);
            expect(artifact.sha256).toBe(hash(bytes));
          }
          const manifestBytes = await readFile(
            join(directory, 'manifest.json'),
          );
          expect(actual.contentHash).toBe(
            createHash('sha256')
              .update(
                JSON.stringify(
                  actual.files.map(({ path, role, sha256 }) => ({
                    path,
                    role,
                    sha256,
                  })),
                ),
              )
              .update('\n')
              .update(manifestBytes)
              .digest('hex'),
          );
          await compareDirectory(requireDirectory(expected.data), directory);
        },
      });
      if (!expected.success) {
        expect(response.result).toEqual(json(expected));
      } else {
        expect(response.release).toEqual({
          success: true,
          data: null,
          diagnostics: [],
        });
        expect(
          (response.result as { diagnostics: unknown }).diagnostics,
        ).toEqual(json(expected.diagnostics));
      }
      expect(await readdir(join(appPath, '.twenty/cli/snapshots'))).toEqual([]);
    };
    const reference = await buildSdkSnapshot(appPath, compareBuild);
    if (!reference.isSnapshotHeld) {
      await compareBuild(reference);
    }
    return reference.result as Awaited<ReturnType<typeof buildSnapshot>>;
  };
  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'twenty-bundle-parity-'));
    const modules = join(root, 'node_modules');
    const sdkPath = join(modules, 'twenty-sdk');
    const sourceSdk = join(REPOSITORY_ROOT, 'packages/twenty-sdk');
    const sdkRequire = createRequire(join(sourceSdk, 'package.json'));

    await mkdir(join(modules, '@sniptt'), { recursive: true });

    for (const name of [
      'sharp',
      'react',
      'react-dom',
      '@types',
      '@sniptt/guards',
      'uuid',
      'esbuild',
      'typescript',
      'tinyglobby',
      'vitest',
      'vite-tsconfig-paths',
      'twenty-shared',
      'twenty-client-sdk',
      'twenty-ui',
    ]) {
      await symlink(
        name === 'uuid'
          ? dirname(sdkRequire.resolve(`${name}/package.json`))
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

    sdkEntryPath = join(root, 'sdk-reference.cjs');
    const sdkSource = join(sourceSdk, 'src');

    await bundle({
      stdin: {
        contents: `export { buildSnapshot as buildSourceSnapshot, releaseSnapshot as releaseSourceSnapshot } from './application-build/build-snapshot';`,
        resolveDir: sdkSource,
      },
      outfile: sdkEntryPath,
      alias: { '@': sdkSource },
      bundle: true,
      packages: 'external',
      platform: 'node',
      format: 'cjs',
      target: 'node24',
      plugins: [SORTED_GLOB_PLUGIN],
    });

    await mkdir(join(root, 'assets'));
    await cp(
      join(sdkSource, 'cli/utilities/build/cover/assets/halftone-backdrop.png'),
      join(root, 'assets/halftone-backdrop.png'),
    );
    await buildTestAppWorker(join(root, 'reference'), {
      aliases: { '@/app/worker/build-source-snapshot': sdkEntryPath },
    });
    await buildTestAppWorker(join(root, 'cli'));
    launch.modulePath = join(root, 'cli/app-worker.cjs');
  }, 60000);

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
    'matches artifacts, checksums, manifest, content hash and diagnostics for %s',
    async (name) => {
      const result = await compareSnapshot(await copyFixture(name));
      expect(result.success, JSON.stringify(result)).toBe(
        name !== 'invalid-app',
      );
    },
    60000,
  );
  it('typechecks the template test setup with an authoring-only SDK', async () => {
    const appPath = join(root, 'fresh-app');
    await createAppProject({
      appDirectory: appPath,
      appName: 'fresh-app',
      appDisplayName: 'Fresh app',
      appDescription: 'Bundle parity fixture',
      signal: new AbortController().signal,
    });
    await symlink(join(root, 'node_modules'), join(appPath, 'node_modules'));
    const configPath = join(appPath, 'tsconfig.json');
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    config.exclude.push('vitest*.config.ts');
    await writeFile(configPath, JSON.stringify(config));
    const result = await compareSnapshot(appPath);
    expect(result.success, JSON.stringify(result)).toBe(true);
    expect(JSON.stringify(result)).not.toContain('twenty-sdk/cli');
  }, 60000);
  it('matches CSS, baked translations, README selection and immutable symlinked assets', async () => {
    const appPath = await copyFixture('minimal-app');
    await mkdir(join(appPath, 'locales'), { recursive: true });
    await writeFile(
      join(appPath, 'locales/fr-FR.json'),
      JSON.stringify({ Hello: 'Bonjour' }),
    );
    await writeFile(join(appPath, 'README.md'), '# Keep the markdown readme\n');
    await writeFile(join(appPath, 'README.txt'), 'Not preferred');
    await writeFile(join(appPath, 'asset-source.txt'), 'original asset');
    await mkdir(join(appPath, 'public'), { recursive: true });
    await symlink(
      join(appPath, 'asset-source.txt'),
      join(appPath, 'public/asset.txt'),
    );
    const component = (await readdir(appPath)).find((file) =>
      file.endsWith('.tsx'),
    );
    if (!component) throw new Error('No front component');
    await writeFile(join(appPath, 'style.css'), 'div { color: red; }');
    const componentPath = join(appPath, component);
    await writeFile(
      componentPath,
      "import './style.css';\n" + (await readFile(componentPath, 'utf8')),
    );
    expect((await compareSnapshot(appPath)).success).toBe(true);
    const first = await buildSnapshot({ appPath });
    if (!first.success) throw new Error(JSON.stringify(first));
    const directory = requireDirectory(first.data);
    try {
      expect(
        (await lstat(join(directory, 'public/asset.txt'))).isSymbolicLink(),
      ).toBe(false);
      await writeFile(join(appPath, 'asset-source.txt'), 'changed asset');
      expect(await readFile(join(directory, 'public/asset.txt'), 'utf8')).toBe(
        'original asset',
      );
      expect(await readFile(join(directory, 'README.md'), 'utf8')).toBe(
        '# Keep the markdown readme\n',
      );
      expect(await pathExists(join(directory, 'README.txt'))).toBe(false);
    } finally {
      await releaseSnapshot({ buildId: first.data.buildId });
    }
  }, 60000);

  it('uses optional sharp for identical covers and warns when it is missing', async () => {
    const appPath = await copyFixture('minimal-app');
    const applicationPath = join(appPath, 'application.config.ts');
    await writeFile(
      applicationPath,
      (await readFile(applicationPath, 'utf8')).replace(
        "displayName: 'Root App',",
        "displayName: 'Root App', logo: 'public/logo.png',",
      ),
    );
    await mkdir(join(appPath, 'public'), { recursive: true });
    await cp(
      join(
        REPOSITORY_ROOT,
        'packages/twenty-sdk/src/cli/utilities/build/cover/assets/halftone-backdrop.png',
      ),
      join(appPath, 'public/logo.png'),
    );
    const reference = await compareSnapshot(appPath);
    expect(reference).toMatchObject({
      success: true,
      data: {
        manifest: {
          application: { galleryImages: ['public/cover.generated.png'] },
        },
      },
    });
    await rm(join(root, 'node_modules/sharp'));
    try {
      const response = await runAppWorker({
        request: { type: 'bundleSnapshot', appPath, holdSnapshot: false },
        signal: new AbortController().signal,
      });
      expect(response.result).toMatchObject({
        success: true,
        diagnostics: expect.arrayContaining([
          expect.objectContaining({
            severity: 'warning',
            message: expect.stringContaining('Skipped cover image generation:'),
          }),
        ]),
      });
      expect(
        (response.result as { data: ToolingBuild }).data.files.some(
          (file) => file.path === 'public/cover.generated.png',
        ),
      ).toBe(false);
      expect(await readdir(join(appPath, '.twenty/cli/snapshots'))).toEqual([]);
    } finally {
      await symlink(
        join(REPOSITORY_ROOT, 'node_modules/sharp'),
        join(root, 'node_modules/sharp'),
      );
    }
  }, 60000);

  it('keeps concurrent snapshots independent and releases only its own files', async () => {
    const appPath = await copyFixture('minimal-app');
    const existingPaths = [
      'keep.txt',
      '.twenty/output/keep.txt',
      '.twenty/snapshots/build-sdk/keep.txt',
      '.twenty/cli/snapshots/build-existing/keep.txt',
    ];
    for (const path of existingPaths) {
      await mkdir(dirname(join(appPath, path)), { recursive: true });
      await writeFile(join(appPath, path), 'existing content');
    }
    const snapshots = await Promise.all([
      buildSnapshot({ appPath }),
      buildSnapshot({ appPath }),
    ]);
    const [first, second] = snapshots;
    if (!first.success || !second.success)
      throw new Error(JSON.stringify(snapshots));
    try {
      expect(first.data.buildId).not.toBe(second.data.buildId);
      expect(first.data.directory).not.toBe(second.data.directory);
      expect(first.data.contentHash).toBe(second.data.contentHash);
      expect(first.data.files).toEqual(second.data.files);
      expect(
        await releaseSnapshot({ buildId: first.data.buildId }),
      ).toMatchObject({ success: true });
      expect(
        await releaseSnapshot({ buildId: first.data.buildId }),
      ).toMatchObject({
        success: false,
        error: { code: 'SNAPSHOT_NOT_FOUND' },
      });
      expect(await releaseSnapshot({ buildId: 'unowned-build' })).toMatchObject(
        { success: false, error: { code: 'SNAPSHOT_NOT_FOUND' } },
      );
      expect(await pathExists(requireDirectory(second.data))).toBe(true);
      for (const path of existingPaths)
        expect(await readFile(join(appPath, path), 'utf8')).toBe(
          'existing content',
        );
    } finally {
      await Promise.all(
        snapshots.map(
          (snapshot) =>
            snapshot.success &&
            releaseSnapshot({ buildId: snapshot.data.buildId }),
        ),
      );
    }
  }, 60000);

  it('cleans cancelled and failed builds without touching existing snapshots', async () => {
    const appPath = await copyFixture('minimal-app');
    const snapshotsPath = join(appPath, '.twenty/cli/snapshots');
    await mkdir(join(snapshotsPath, 'build-existing'), { recursive: true });
    expect(
      await buildSnapshot({ appPath, signal: AbortSignal.abort() }),
    ).toMatchObject({ success: false, error: { code: 'CANCELLED' } });
    await writeFile(
      join(appPath, 'my.function.ts'),
      'export default defineLogicFunction({ broken syntax',
    );
    expect(await buildSnapshot({ appPath })).toMatchObject({
      success: false,
      error: { code: expect.stringMatching(/BUILD_FAILED/) },
    });
    expect(await readdir(snapshotsPath)).toEqual(['build-existing']);
    expect(await buildSnapshot({ appPath: 'relative-path' })).toMatchObject({
      success: false,
      error: { code: 'INVALID_APP_PATH' },
    });
  }, 60000);

  it.each(['source error', 'unbuilt project reference'])(
    'matches a build failure for %s and removes only the failed snapshot',
    async (failure) => {
      const appPath = await copyFixture('minimal-app');
      const snapshotsPath = join(appPath, '.twenty/cli/snapshots');
      await mkdir(join(snapshotsPath, 'build-existing'), { recursive: true });
      const expectedCode = failure === 'source error' ? 'TS2322' : 'TS6305';
      if (failure === 'source error') {
        await writeFile(
          join(appPath, 'type-error.ts'),
          'export const broken: number = "bad";',
        );
      } else {
        await mkdir(join(appPath, 'referenced'));
        await writeFile(
          join(appPath, 'referenced/source.ts'),
          'export const value = 1;',
        );
        await writeFile(
          join(appPath, 'referenced/tsconfig.json'),
          JSON.stringify({
            compilerOptions: { composite: true, outDir: 'dist', types: [] },
            files: ['source.ts'],
          }),
        );
        const configPath = join(appPath, 'tsconfig.json');
        const config = JSON.parse(await readFile(configPath, 'utf8'));
        config.references = [{ path: './referenced' }];
        await writeFile(configPath, JSON.stringify(config));
      }
      const expected = (await buildSdkSnapshot(appPath)).result;
      const response = await runAppWorker({
        request: { type: 'bundleSnapshot', appPath, holdSnapshot: true },
        signal: new AbortController().signal,
      });
      expect(response.result).toEqual(json(expected));
      expect(response.result).toMatchObject({
        success: false,
        error: { code: 'TYPECHECK_FAILED' },
        diagnostics: expect.arrayContaining([
          expect.objectContaining({ code: expectedCode }),
        ]),
      });
      expect(response.isSnapshotHeld).toBe(false);
      expect(await readdir(snapshotsPath)).toEqual(['build-existing']);
    },
    60000,
  );

  it('releases the held snapshot when its consumer fails', async () => {
    const appPath = await copyFixture('minimal-app');
    await expect(
      runAppWorker({
        request: { type: 'bundleSnapshot', appPath, holdSnapshot: true },
        signal: new AbortController().signal,
        useHeldSnapshot: async () => {
          throw new Error('Upload failed');
        },
      }),
    ).rejects.toThrow('Upload failed');
    expect(await readdir(join(appPath, '.twenty/cli/snapshots'))).toEqual([]);
  }, 60000);

  it('stubs the project SDK exports including its runtime constants', async () => {
    const appPath = await copyFixture('minimal-app');
    const sdkPath = join(root, 'node_modules/twenty-sdk');
    const packagePath = join(sdkPath, 'package.json');
    const originalPackage = await readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(originalPackage);
    const defineEntry = createRequire(join(appPath, 'package.json')).resolve(
      'twenty-sdk/define',
    );
    await writeFile(
      join(sdkPath, 'custom-define.cjs'),
      `module.exports = { ...require(${JSON.stringify(defineEntry)}), CUSTOM_RUNTIME_CONSTANT: 42 };`,
    );
    await writeFile(
      join(sdkPath, 'custom-define.d.ts'),
      "export * from './dist/define/index'; export declare const CUSTOM_RUNTIME_CONSTANT: 42;",
    );
    packageJson.exports['./define'] = {
      types: './custom-define.d.ts',
      import: './custom-define.cjs',
      require: './custom-define.cjs',
    };
    await writeFile(packagePath, JSON.stringify(packageJson));
    const functionPath = join(appPath, 'my.function.ts');
    await writeFile(
      functionPath,
      (await readFile(functionPath, 'utf8'))
        .replace(
          'import { defineLogicFunction }',
          'import { defineLogicFunction, CUSTOM_RUNTIME_CONSTANT }',
        )
        .replace(
          "return 'my-function-result'",
          'return CUSTOM_RUNTIME_CONSTANT',
        ),
    );
    try {
      await runAppWorker({
        request: { type: 'bundleSnapshot', appPath, holdSnapshot: true },
        signal: new AbortController().signal,
        useHeldSnapshot: async ({ result }) => {
          expect(result).toMatchObject({ success: true });
          const snapshot = (result as { data: ToolingBuild }).data;
          const builtFunction = await import(
            pathToFileURL(join(requireDirectory(snapshot), 'my.function.mjs'))
              .href
          );
          expect(builtFunction.default.config.handler()).toBe(42);
        },
      });
    } finally {
      await writeFile(packagePath, originalPackage);
    }
  }, 60000);
});
