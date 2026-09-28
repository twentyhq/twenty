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
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { type BuildSnapshot } from '@/application-build/types';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { appBuild } from '@/cli/operations/build';
import { pathExists } from '@/cli/utilities/file/fs-utils';
import { buildAppSnapshot, releaseAppSnapshot } from '@/application-build';

describe('buildAppSnapshot snapshots', () => {
  let appPath: string;
  let first: BuildSnapshot;
  let second: BuildSnapshot;
  let originalTsconfig: string;
  const snapshots: BuildSnapshot[] = [];

  const build = async () => {
    const result = await buildAppSnapshot({ appPath });

    if (!result.success) {
      throw new Error(JSON.stringify(result));
    }

    snapshots.push(result.data);

    return result.data;
  };

  beforeAll(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-tooling-build-'));
    await cp(MINIMAL_APP_PATH, appPath, {
      recursive: true,
      filter: (source) =>
        !['node_modules', '.twenty'].includes(basename(source)),
    });
    await symlink(
      resolve(MINIMAL_APP_PATH, '../../../../node_modules'),
      join(appPath, 'node_modules'),
      'junction',
    );
    originalTsconfig = await readFile(join(appPath, 'tsconfig.json'), 'utf8');
    await mkdir(join(appPath, 'public'), { recursive: true });
    for (const fileName of ['z-last.txt', 'ä-unicode.txt', 'B-first.txt']) {
      await writeFile(join(appPath, 'public', fileName), fileName);
    }
    await writeFile(join(appPath, 'asset-source.txt'), 'original asset');
    await symlink(
      join(appPath, 'asset-source.txt'),
      join(appPath, 'public', 'asset.txt'),
      'file',
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(() => {
        throw new Error('Local tooling must not make network requests');
      }),
    );
    [first, second] = await Promise.all([build(), build()]);
  }, 120000);

  afterEach(async () => {
    await writeFile(join(appPath, 'asset-source.txt'), 'original asset');
    await writeFile(join(appPath, 'tsconfig.json'), originalTsconfig);
    await rm(join(appPath, 'type-error.ts'), { force: true });
    await rm(join(appPath, 'referenced'), { recursive: true, force: true });
    await rm(join(appPath, '.twenty', 'output'), {
      recursive: true,
      force: true,
    });
  });

  afterAll(async () => {
    for (const snapshot of snapshots) {
      await releaseAppSnapshot({ buildId: snapshot.buildId });
    }

    vi.unstubAllGlobals();
    await rm(appPath, { recursive: true, force: true });
  });

  it('returns complete upload roles with checksums matching the snapshot bytes', async () => {
    expect([...new Set(first.files.map((file) => file.role))].sort()).toEqual([
      'built-front-component',
      'built-logic-function',
      'dependencies',
      'public-asset',
      'source',
    ]);

    for (const artifact of first.files) {
      const bytes = await readFile(join(first.directory, artifact.path));

      expect(artifact.size).toBe(bytes.length);
      expect(artifact.sha256).toBe(
        createHash('sha256').update(bytes).digest('hex'),
      );
    }

    const manifest = JSON.parse(
      await readFile(join(first.directory, 'manifest.json'), 'utf8'),
    ) as Manifest;

    expect(first.manifest).toEqual(manifest);
    expect(manifest.publicAssets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          checksum: createHash('md5').update('original asset').digest('hex'),
        }),
      ]),
    );
    expect(first.application).toMatchObject({ name: 'minimal-app' });
  });

  it('keeps concurrent builds independent and hashes unchanged content identically', () => {
    expect(first.buildId).not.toBe(second.buildId);
    expect(first.directory).not.toBe(second.directory);
    expect(first.contentHash).toBe(second.contentHash);
    expect(first.files).toEqual(second.files);
  });

  it('orders artifact paths independently of locale collation', () => {
    expect(
      first.files
        .map((file) => file.path)
        .filter((filePath) => filePath.startsWith('public/')),
    ).toEqual([
      'public/B-first.txt',
      'public/asset.txt',
      'public/z-last.txt',
      'public/ä-unicode.txt',
    ]);
  });

  it('preserves the existing build output and symlink behavior beside snapshots', async () => {
    const result = await appBuild({ appPath });

    expect(result).toMatchObject({
      success: true,
      data: { outputDir: join(appPath, '.twenty', 'output') },
    });
    expect(
      (
        await lstat(join(appPath, '.twenty', 'output', 'public', 'asset.txt'))
      ).isSymbolicLink(),
    ).toBe(true);

    for (const artifact of first.files) {
      expect(
        await readFile(join(appPath, '.twenty', 'output', artifact.path)),
      ).toEqual(await readFile(join(first.directory, artifact.path)));
    }

    expect(
      await readFile(join(appPath, '.twenty', 'output', 'manifest.json')),
    ).toEqual(await readFile(join(first.directory, 'manifest.json')));
  }, 120000);

  it('retains copied bytes after source changes and releases only its own snapshot', async () => {
    const retainedBytes = await Promise.all(
      first.files.map((file) => readFile(join(first.directory, file.path))),
    );

    await writeFile(join(appPath, 'asset-source.txt'), 'changed asset');
    const changed = await build();

    expect(changed.contentHash).not.toBe(first.contentHash);
    expect(
      await Promise.all(
        first.files.map((file) => readFile(join(first.directory, file.path))),
      ),
    ).toEqual(retainedBytes);
    expect(await releaseAppSnapshot({ buildId: changed.buildId })).toEqual({
      success: true,
      data: null,
      diagnostics: [],
    });
    expect(await pathExists(dirname(changed.directory))).toBe(false);
    expect(await pathExists(first.directory)).toBe(true);
    expect(await pathExists(second.directory)).toBe(true);
    expect(
      await releaseAppSnapshot({ buildId: changed.buildId }),
    ).toMatchObject({ success: false, error: { code: 'SNAPSHOT_NOT_FOUND' } });
    expect(
      await releaseAppSnapshot({ buildId: 'unowned-build' }),
    ).toMatchObject({ success: false, error: { code: 'SNAPSHOT_NOT_FOUND' } });
    expect(await pathExists(first.directory)).toBe(true);
  }, 120000);

  it('removes only the failed build after a compiler error', async () => {
    const snapshotsDirectory = join(appPath, '.twenty', 'snapshots');
    const directoriesBefore = (await readdir(snapshotsDirectory)).sort();

    await writeFile(
      join(appPath, 'type-error.ts'),
      'export const broken: number = "bad";',
    );

    expect(await buildAppSnapshot({ appPath })).toMatchObject({
      success: false,
      error: { code: 'TYPECHECK_FAILED' },
      diagnostics: expect.arrayContaining([
        expect.objectContaining({ code: 'TS2322' }),
      ]),
    });
    expect((await readdir(snapshotsDirectory)).sort()).toEqual(
      directoriesBefore,
    );
    expect(await pathExists(first.directory)).toBe(true);
  }, 120000);

  it('preserves existing app files and output folders when releasing a snapshot', async () => {
    const existingPaths = [
      join(appPath, 'keep.txt'),
      join(appPath, '.twenty', 'output', 'keep.txt'),
      join(appPath, '.twenty', 'snapshots', 'build-existing', 'keep.txt'),
    ];

    for (const filePath of existingPaths) {
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, 'existing content');
    }

    const snapshot = await build();

    expect(await releaseAppSnapshot({ buildId: snapshot.buildId })).toEqual({
      success: true,
      data: null,
      diagnostics: [],
    });
    expect(await pathExists(dirname(snapshot.directory))).toBe(false);

    for (const filePath of existingPaths) {
      expect(await readFile(filePath, 'utf8')).toBe('existing content');
    }
  }, 120000);

  it('does not create output for a cancelled build', async () => {
    const snapshotsDirectory = join(appPath, '.twenty', 'snapshots');
    const directoriesBefore = (await readdir(snapshotsDirectory)).sort();

    expect(
      await buildAppSnapshot({ appPath, signal: AbortSignal.abort() }),
    ).toMatchObject({ success: false, error: { code: 'CANCELLED' } });
    expect((await readdir(snapshotsDirectory)).sort()).toEqual(
      directoriesBefore,
    );
    expect(await pathExists(join(appPath, '.twenty', 'output'))).toBe(false);
  });

  it('rejects unbuilt TypeScript references and cleans the incomplete snapshot', async () => {
    const snapshotsDirectory = join(appPath, '.twenty', 'snapshots');
    const directoriesBefore = (await readdir(snapshotsDirectory)).sort();

    await mkdir(join(appPath, 'referenced'));
    await writeFile(
      join(appPath, 'referenced', 'source.ts'),
      'export const value = 1;',
    );
    await writeFile(
      join(appPath, 'referenced', 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: { composite: true, outDir: 'dist', types: [] },
        files: ['source.ts'],
      }),
    );
    await writeFile(
      join(appPath, 'tsconfig.json'),
      JSON.stringify({
        ...JSON.parse(originalTsconfig),
        references: [{ path: './referenced' }],
      }),
    );

    expect(await buildAppSnapshot({ appPath })).toMatchObject({
      success: false,
      error: { code: 'TYPECHECK_FAILED' },
      diagnostics: expect.arrayContaining([
        expect.objectContaining({ severity: 'error', code: 'TS6305' }),
      ]),
    });
    expect((await readdir(snapshotsDirectory)).sort()).toEqual(
      directoriesBefore,
    );
  }, 120000);
});
