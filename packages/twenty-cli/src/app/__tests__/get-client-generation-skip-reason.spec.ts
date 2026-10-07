import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getClientGenerationSkipReason } from '@/app/get-client-generation-skip-reason';
describe('getClientGenerationSkipReason', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-cli-client-skip-'));
  });

  afterEach(() => rm(appPath, { recursive: true, force: true }));

  it('skips an app without its own client package', async () => {
    expect(await getClientGenerationSkipReason({ appPath })).toBe(
      "twenty-client-sdk is not installed in the app's own node_modules.",
    );
  });

  it('generates into an installed client package', async () => {
    await mkdir(join(appPath, 'node_modules', 'twenty-client-sdk'), {
      recursive: true,
    });

    expect(await getClientGenerationSkipReason({ appPath })).toBeUndefined();
  });

  it('leaves a dangling client package link to the client generator', async () => {
    await mkdir(join(appPath, 'node_modules'));
    await symlink(
      join(appPath, 'missing'),
      join(appPath, 'node_modules', 'twenty-client-sdk'),
    );

    expect(await getClientGenerationSkipReason({ appPath })).toBeUndefined();
  });

  it('leaves an unreadable client package path to the client generator', async () => {
    await writeFile(join(appPath, 'node_modules'), 'not a directory');

    expect(await getClientGenerationSkipReason({ appPath })).toBeUndefined();
  });
});
