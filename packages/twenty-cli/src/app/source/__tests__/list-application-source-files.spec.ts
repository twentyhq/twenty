import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { listApplicationSourceFiles } from '@/app/source/list-application-source-files';

describe('listApplicationSourceFiles', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-source-files-'));

    for (const file of [
      'z.tsx',
      'b/second.ts',
      'a/nested/deep.ts',
      'a/first.ts',
      'node_modules/package/index.ts',
      'types.d.ts',
      'dist/output.ts',
      '.twenty/cli/snapshot.ts',
      'notes.md',
    ]) {
      await mkdir(dirname(join(appPath, file)), { recursive: true });
      await writeFile(join(appPath, file), '');
    }
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('lists app source files in the same sorted order on every run', async () => {
    const runs = await Promise.all(
      Array.from({ length: 10 }, () => listApplicationSourceFiles(appPath)),
    );

    for (const files of runs) {
      expect(files.map((file) => relative(appPath, file))).toEqual([
        'a/first.ts',
        'a/nested/deep.ts',
        'b/second.ts',
        'z.tsx',
      ]);
    }
  });
});
