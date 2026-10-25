import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { APPLICATION_PACKAGE_YARN_LOCK_PATH } from 'twenty-shared/application';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { copyYarnLockIntoPackage } from '@/app/publish/copy-yarn-lock-into-package';
import { type ToolingBuild } from '@/app/types/tooling-result.type';

const YARN_LOCK_CONTENT = '# yarn lockfile v1\n';

const buildWithFiles = (paths: string[]): ToolingBuild => ({
  buildId: 'build-id',
  contentHash: 'content-hash',
  application: {
    universalIdentifier: '20202020-0000-4000-8000-000000000001',
    name: 'test-app',
    displayName: 'Test App',
  },
  manifestFormat: 'twenty-application',
  manifest: {},
  files: paths.map((path) => ({
    path,
    role: 'dependencies',
    sourcePath: path,
    size: 0,
    sha256: '',
  })),
});

describe('copyYarnLockIntoPackage', () => {
  let snapshotDirectory: string;

  beforeEach(async () => {
    snapshotDirectory = await mkdtemp(join(tmpdir(), 'packed-yarn-lock-'));
  });

  afterEach(async () => {
    await rm(snapshotDirectory, { recursive: true, force: true });
  });

  it('copies the yarn.lock to a path npm keeps in the package', async () => {
    await writeFile(join(snapshotDirectory, 'yarn.lock'), YARN_LOCK_CONTENT);

    const packagedPath = await copyYarnLockIntoPackage({
      snapshotDirectory,
      build: buildWithFiles(['package.json', 'yarn.lock']),
    });

    expect(packagedPath).toBe(APPLICATION_PACKAGE_YARN_LOCK_PATH);
    expect(
      await readFile(
        join(snapshotDirectory, APPLICATION_PACKAGE_YARN_LOCK_PATH),
        'utf8',
      ),
    ).toBe(YARN_LOCK_CONTENT);
  });

  it('packs nothing extra when the build has no yarn.lock', async () => {
    expect(
      await copyYarnLockIntoPackage({
        snapshotDirectory,
        build: buildWithFiles(['package.json']),
      }),
    ).toBeUndefined();
  });
});
