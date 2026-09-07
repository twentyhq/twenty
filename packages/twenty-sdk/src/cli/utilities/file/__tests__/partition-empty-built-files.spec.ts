import {
  formatSkippedEmptyFile,
  partitionEmptyBuiltFiles,
} from '@/cli/utilities/file/partition-empty-built-files';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { FileFolder } from 'twenty-shared/types';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('partitionEmptyBuiltFiles', () => {
  let appPath: string;

  const writeBuiltFile = async (builtPath: string, content: string) => {
    await mkdir(dirname(join(appPath, builtPath)), { recursive: true });
    await writeFile(join(appPath, builtPath), content);
  };

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'partition-empty-built-files-'));
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('should leave an empty lockfile out and keep the other dependency files', async () => {
    await writeBuiltFile('.twenty/output/yarn.lock', '');
    await writeBuiltFile('.twenty/output/package.json', '{"name":"app"}');

    const { filesToUpload, skippedFiles } = partitionEmptyBuiltFiles({
      appPath,
      files: [
        {
          builtPath: '.twenty/output/yarn.lock',
          fileFolder: FileFolder.Dependencies,
        },
        {
          builtPath: '.twenty/output/package.json',
          fileFolder: FileFolder.Dependencies,
        },
      ],
    });

    expect(filesToUpload.map(({ builtPath }) => builtPath)).toEqual([
      '.twenty/output/package.json',
    ]);
    expect(skippedFiles.map(({ builtPath }) => builtPath)).toEqual([
      '.twenty/output/yarn.lock',
    ]);
  });

  it('should keep an empty file the application may reference, whatever its folder', async () => {
    await writeBuiltFile('.twenty/output/public/placeholder.txt', '');
    await writeBuiltFile('.twenty/output/src/empty.ts', '');
    await writeBuiltFile('.twenty/output/src/handler.mjs', '');

    const { filesToUpload, skippedFiles } = partitionEmptyBuiltFiles({
      appPath,
      files: [
        {
          builtPath: '.twenty/output/public/placeholder.txt',
          fileFolder: FileFolder.PublicAsset,
        },
        {
          builtPath: '.twenty/output/src/empty.ts',
          fileFolder: FileFolder.Source,
        },
        {
          builtPath: '.twenty/output/src/handler.mjs',
          fileFolder: FileFolder.BuiltLogicFunction,
        },
      ],
    });

    expect(filesToUpload).toHaveLength(3);
    expect(skippedFiles).toEqual([]);
  });

  it('should carry every property of the files it partitions', async () => {
    await writeBuiltFile('.twenty/output/yarn.lock', '');

    const { skippedFiles } = partitionEmptyBuiltFiles({
      appPath,
      files: [
        {
          builtPath: '.twenty/output/yarn.lock',
          fileFolder: FileFolder.Dependencies,
          sourcePath: 'yarn.lock',
        },
      ],
    });

    expect(skippedFiles).toEqual([
      {
        builtPath: '.twenty/output/yarn.lock',
        fileFolder: FileFolder.Dependencies,
        sourcePath: 'yarn.lock',
      },
    ]);
  });

  it('should word the skip notice after the built path', () => {
    expect(formatSkippedEmptyFile('.twenty/output/yarn.lock')).toBe(
      'Skipped .twenty/output/yarn.lock: the built file is empty',
    );
  });
});
