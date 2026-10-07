import { createHash } from 'node:crypto';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { retainDevSnapshot } from '@/app/dev/retain-dev-snapshot';
import { type ToolingBuild } from '@/app/types/tooling-result.type';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});
const fixture = async () => {
  const appPath = await mkdtemp(join(tmpdir(), 'dev-snapshot-'));
  roots.push(appPath);
  const directory = join(appPath, '.twenty/cli/snapshots/build-original/files');
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'bundle.js'), 'original');
  const build: ToolingBuild = {
    buildId: 'test',
    directory,
    contentHash: 'opaque-hash',
    manifest: {},
    manifestFormat: 'twenty-application',
    application: {
      name: 'test',
      displayName: 'Test',
      universalIdentifier: 'id',
    },
    files: [
      {
        path: 'bundle.js',
        role: 'built-logic-function',
        sourcePath: 'source.ts',
        size: 8,
        sha256: createHash('sha256').update('original').digest('hex'),
      },
    ],
  };

  return {
    build,
    appPath,
    signal: new AbortController().signal,
  };
};

describe('retained dev snapshots', () => {
  it('keeps independent verified bytes after the compiler snapshot is changed and released', async () => {
    const options = await fixture();
    const retained = await retainDevSnapshot(options);
    await writeFile(join(options.build.directory!, 'bundle.js'), 'different');
    await rm(options.build.directory!, { recursive: true });
    expect(
      await readFile(join(retained.build.directory, 'bundle.js'), 'utf8'),
    ).toBe('original');
    expect(retained.build.contentHash).toBe('opaque-hash');
    await retained.release();
    await expect(
      readFile(join(retained.build.directory, 'bundle.js')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it.each(['changed', 'escape', 'duplicate'])(
    'cleans partial copies on %s artifacts',
    async (mode) => {
      const options = await fixture();
      if (mode === 'changed')
        await writeFile(join(options.build.directory!, 'bundle.js'), 'bad');
      if (mode === 'escape') options.build.files[0].path = '../../outside';
      if (mode === 'duplicate')
        options.build.files.push(options.build.files[0]);
      await expect(retainDevSnapshot(options)).rejects.toThrow();
      expect(
        await readdir(join(options.appPath, '.twenty/cli/snapshots')),
      ).toEqual(['build-original']);
    },
  );

  it('does not allocate a snapshot after cancellation', async () => {
    const options = await fixture();
    await expect(
      retainDevSnapshot({ ...options, signal: AbortSignal.abort() }),
    ).rejects.toThrow();
    expect(
      await readdir(join(options.appPath, '.twenty/cli/snapshots')),
    ).toEqual(['build-original']);
  });
});
