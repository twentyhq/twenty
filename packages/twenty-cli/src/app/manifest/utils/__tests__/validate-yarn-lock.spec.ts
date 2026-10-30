import {
  validateYarnLock,
  validateYarnLockFile,
} from '@/app/manifest/utils/validate-yarn-lock';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EMPTY_YARN_LOCK_CONTENT } from 'twenty-shared/application';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('validateYarnLock', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'validate-yarn-lock-'));
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('should refuse a project without a lockfile and say how to generate it', async () => {
    const errors = await validateYarnLock(appPath);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^yarn\.lock not found\./);
    expect(errors[0]).toContain('yarn install');
  });

  it('should accept a lockfile with content', async () => {
    await writeFile(join(appPath, 'yarn.lock'), EMPTY_YARN_LOCK_CONTENT);

    expect(await validateYarnLock(appPath)).toEqual([]);
  });

  it('should check the file it is given rather than the project lockfile', async () => {
    await writeFile(join(appPath, 'yarn.lock'), EMPTY_YARN_LOCK_CONTENT);
    await writeFile(join(appPath, 'copy.lock'), '');

    expect(await validateYarnLock(appPath)).toEqual([]);
    expect(await validateYarnLockFile(join(appPath, 'copy.lock'))).toHaveLength(
      1,
    );
  });

  it('should refuse an empty lockfile and say how to regenerate it', async () => {
    await writeFile(join(appPath, 'yarn.lock'), '');

    const errors = await validateYarnLock(appPath);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^yarn\.lock is empty\./);
    expect(errors[0]).toContain('yarn install');
  });
});
