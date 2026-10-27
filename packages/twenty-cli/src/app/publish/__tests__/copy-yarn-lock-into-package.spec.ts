import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  APPLICATION_PACKAGE_YARN_LOCK_PATH,
  EMPTY_YARN_LOCK_CONTENT,
} from 'twenty-shared/application';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { copyYarnLockIntoPackage } from '@/app/publish/copy-yarn-lock-into-package';

describe('copyYarnLockIntoPackage', () => {
  let snapshotDirectory: string;

  beforeEach(async () => {
    snapshotDirectory = await mkdtemp(join(tmpdir(), 'packed-yarn-lock-'));
  });

  afterEach(async () => {
    await rm(snapshotDirectory, { recursive: true, force: true });
  });

  it('copies the yarn.lock to a path npm keeps in the package', async () => {
    await writeFile(
      join(snapshotDirectory, 'yarn.lock'),
      EMPTY_YARN_LOCK_CONTENT,
    );

    await copyYarnLockIntoPackage(snapshotDirectory);

    expect(
      await readFile(
        join(snapshotDirectory, APPLICATION_PACKAGE_YARN_LOCK_PATH),
        'utf8',
      ),
    ).toBe(EMPTY_YARN_LOCK_CONTENT);
  });

  it('fails when the build has no yarn.lock', async () => {
    await expect(copyYarnLockIntoPackage(snapshotDirectory)).rejects.toThrow(
      'ENOENT',
    );
  });
});
