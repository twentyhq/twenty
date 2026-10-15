import * as fileSystem from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { emptyDir, pathExists } from '@/app/fs-utils';

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof fileSystem>();

  return { ...actual, access: vi.fn(actual.access) };
});

const directories: string[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    directories
      .splice(0)
      .map((directory) =>
        fileSystem.rm(directory, { recursive: true, force: true }),
      ),
  );
});

describe('build filesystem operations', () => {
  it('refuses to empty a linked output directory without deleting its contents', async () => {
    const root = await fileSystem.mkdtemp(join(tmpdir(), 'cli-output-'));
    directories.push(root);
    const external = join(root, 'external');
    const output = join(root, 'output');
    await fileSystem.mkdir(external);
    await fileSystem.writeFile(join(external, 'keep.txt'), 'keep');
    await fileSystem.symlink(external, output);

    await expect(emptyDir(output)).rejects.toThrow('symbolic link');
    expect(await fileSystem.readFile(join(external, 'keep.txt'), 'utf8')).toBe(
      'keep',
    );
  });

  it.each(['EACCES', 'EIO'])(
    'does not treat %s as a missing asset',
    async (code) => {
      const error = Object.assign(new Error('asset unavailable'), { code });
      vi.mocked(fileSystem.access).mockRejectedValueOnce(error);

      await expect(pathExists('/asset')).rejects.toBe(error);
    },
  );

  it('returns false for a missing asset', async () => {
    vi.mocked(fileSystem.access).mockRejectedValueOnce(
      Object.assign(new Error('missing'), { code: 'ENOENT' }),
    );

    expect(await pathExists('/asset')).toBe(false);
  });
});
