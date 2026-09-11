import {
  hasPullBaseFile,
  PULL_BASE_FILE_PATH,
} from '@/cli/utilities/pull/pull-base-file';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('hasPullBaseFile', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'has-pull-base-file-'));
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('should report no base in a project that was never pulled into', async () => {
    expect(await hasPullBaseFile({ appPath })).toBe(false);
  });

  it('should report a base in a project that was pulled into', async () => {
    const baseFilePath = join(appPath, PULL_BASE_FILE_PATH);

    await mkdir(dirname(baseFilePath), { recursive: true });
    await writeFile(baseFilePath, '{}');

    expect(await hasPullBaseFile({ appPath })).toBe(true);
  });

  it('should report a base even when its content cannot be parsed', async () => {
    const baseFilePath = join(appPath, PULL_BASE_FILE_PATH);

    await mkdir(dirname(baseFilePath), { recursive: true });
    await writeFile(baseFilePath, '{ "version": 1, ');

    expect(await hasPullBaseFile({ appPath })).toBe(true);
  });
});
