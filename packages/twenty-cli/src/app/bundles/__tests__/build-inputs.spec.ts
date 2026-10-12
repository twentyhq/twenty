import {
  mkdir,
  mkdtemp,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it, vi } from 'vitest';
import { FileFolder } from 'twenty-shared/types';
import { copyReadmeToOutput } from '@/app/bundles/copy-readme-to-output';
import { esbuildOneShotBuild } from '@/app/bundles/esbuild-one-shot-build';
import { collectWatchInputs } from '@/app/dev/collect-watch-inputs';
import { readWatchInputStamp } from '@/app/dev/read-watch-input-stamp';

it('tracks the real README target so edits invalidate a build', async () => {
  const root = await mkdtemp(join(tmpdir(), 'readme-watch-'));
  try {
    const appPath = join(root, 'app');
    const readme = join(root, 'README.md');
    await mkdir(appPath);
    await writeFile(readme, 'before');
    await symlink(readme, join(appPath, 'README.md'));
    const { watchInputs } = await collectWatchInputs(() =>
      copyReadmeToOutput({ appPath, dereferenceSymlinks: true }),
    );
    const canonicalReadme = await realpath(readme);
    const input = watchInputs.find((entry) => entry.path === canonicalReadme);
    expect(input?.path).toBe(await realpath(readme));
    if (!input) throw new Error('README was not watched');
    await writeFile(readme, 'after with new content');
    expect(readWatchInputStamp(input)).not.toBe(input.stamp);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

it('rejects colliding TypeScript entry points before building', async () => {
  const onFileBuilt = vi.fn();
  await expect(
    esbuildOneShotBuild({
      appPath: '/app',
      sourcePaths: ['src/example.ts', 'src/example.tsx'],
      fileFolder: FileFolder.BuiltLogicFunction,
      buildOptions: {},
      onFileBuilt,
    }),
  ).rejects.toThrow('produce the same build output');
  expect(onFileBuilt).not.toHaveBeenCalled();
});
