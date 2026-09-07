import { applyPullWrites } from '@/cli/utilities/pull/apply-pull-writes';
import { type PullWrite } from '@/cli/utilities/pull/plan-pull-writes';
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
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const buildWrite = (relativePath: string, content: string): PullWrite => ({
  kind: 'object',
  universalIdentifier: relativePath,
  relativePath,
  content,
  isRegeneration: false,
});

describe('applyPullWrites', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'apply-pull-writes-'));
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  const readAppFile = (relativePath: string) =>
    readFile(join(appPath, relativePath), 'utf-8');

  it('should write the planned files and delete the planned ones', async () => {
    await mkdir(join(appPath, 'src'), { recursive: true });
    await writeFile(join(appPath, 'src/gone.ts'), 'previous');

    await applyPullWrites({
      appPath,
      writes: [buildWrite('src/pet.object.ts', 'written')],
      deletions: [{ universalIdentifier: 'gone', relativePath: 'src/gone.ts' }],
    });

    expect(await readAppFile('src/pet.object.ts')).toBe('written');
    await expect(readAppFile('src/gone.ts')).rejects.toThrow();
  });

  it('should leave no working directory behind', async () => {
    await applyPullWrites({
      appPath,
      writes: [buildWrite('src/pet.object.ts', 'written')],
      deletions: [],
    });

    const workDirectoryEntries = await readdir(join(appPath, '.twenty'));

    expect(
      workDirectoryEntries.filter((entry) =>
        /^pull-(staging|backup)-/.test(entry),
      ),
    ).toEqual([]);
  });

  it('should restore every file it had already replaced when a later write fails', async () => {
    await mkdir(join(appPath, 'src'), { recursive: true });
    await writeFile(join(appPath, 'src/first.ts'), 'original first');
    await writeFile(join(appPath, 'src/second.ts'), 'original second');
    await writeFile(
      join(appPath, 'src/nested'),
      'a file where a folder is needed',
    );

    await expect(
      applyPullWrites({
        appPath,
        writes: [
          buildWrite('src/first.ts', 'new first'),
          buildWrite('src/second.ts', 'new second'),
          buildWrite('src/nested/deep.object.ts', 'never lands'),
        ],
        deletions: [],
      }),
    ).rejects.toThrow();

    expect(await readAppFile('src/first.ts')).toBe('original first');
    expect(await readAppFile('src/second.ts')).toBe('original second');
  });

  it('should put back a file it had already deleted when a later step fails', async () => {
    await mkdir(join(appPath, 'src'), { recursive: true });
    await writeFile(join(appPath, 'src/kept.ts'), 'original kept');
    await writeFile(
      join(appPath, 'src/nested'),
      'a file where a folder is needed',
    );

    await expect(
      applyPullWrites({
        appPath,
        writes: [
          buildWrite('src/kept.ts', 'new kept'),
          buildWrite('src/nested/deep.object.ts', 'never lands'),
        ],
        deletions: [],
      }),
    ).rejects.toThrow();

    expect(await readAppFile('src/kept.ts')).toBe('original kept');
  });

  it('should remove a new file it created when a later write fails', async () => {
    await mkdir(join(appPath, 'src'), { recursive: true });
    await writeFile(
      join(appPath, 'src/nested'),
      'a file where a folder is needed',
    );

    await expect(
      applyPullWrites({
        appPath,
        writes: [
          buildWrite('src/brand-new.object.ts', 'new content'),
          buildWrite('src/nested/deep.object.ts', 'never lands'),
        ],
        deletions: [],
      }),
    ).rejects.toThrow();

    await expect(readAppFile('src/brand-new.object.ts')).rejects.toThrow();
  });

  it('should refuse a plan whose two entities resolve to the same file', async () => {
    await expect(
      applyPullWrites({
        appPath,
        writes: [
          buildWrite('src/pet.object.ts', 'one'),
          buildWrite('src/pet.object.ts', 'two'),
        ],
        deletions: [],
      }),
    ).rejects.toThrow('same file path');
  });

  it('should refuse to delete a folder standing where a planned file goes', async () => {
    await mkdir(join(appPath, 'src/pet.object.ts'), { recursive: true });

    await expect(
      applyPullWrites({
        appPath,
        writes: [buildWrite('src/pet.object.ts', 'written')],
        deletions: [],
      }),
    ).rejects.toThrow('never deletes a folder');
  });
});
