import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { LocalDriver } from 'src/engine/core-modules/file-storage/drivers/local.driver';

describe('LocalDriver security hardening', () => {
  const cleanupPaths: string[] = [];

  const createTempDirectory = async (prefix: string) => {
    const dir = await mkdtemp(path.join(tmpdir(), prefix));

    cleanupPaths.push(dir);

    return dir;
  };

  afterAll(async () => {
    await Promise.all(
      cleanupPaths.map(async (directoryPath) => {
        await rm(directoryPath, { recursive: true, force: true });
      }),
    );
  });

  it('should reject writeFile when target is a symlink', async () => {
    const storagePath = await createTempDirectory('local-driver-storage-');
    const outsidePath = await createTempDirectory('local-driver-outside-');
    const outsideFilePath = path.join(outsidePath, 'outside.txt');
    const symlinkFolderPath = path.join(storagePath, 'workspace', 'app');
    const symlinkFilePath = path.join(symlinkFolderPath, 'target.txt');

    await mkdir(symlinkFolderPath, { recursive: true });
    await writeFile(outsideFilePath, 'outside');
    await symlink(outsideFilePath, symlinkFilePath);

    const driver = new LocalDriver({ storagePath });

    await expect(
      driver.writeFile({
        filePath: 'workspace/app/target.txt',
        sourceFile: Buffer.from('new-content'),
        mimeType: undefined,
      }),
    ).rejects.toMatchObject({
      code: FileStorageExceptionCode.ACCESS_DENIED,
    });

    await expect(readFile(outsideFilePath, 'utf8')).resolves.toBe('outside');
  });

  it('should reject downloadFile when path resolves outside storage', async () => {
    const storagePath = await createTempDirectory('local-driver-storage-');
    const outsidePath = await createTempDirectory('local-driver-outside-');
    const outsideFilePath = path.join(outsidePath, 'outside.txt');
    const symlinkFolderPath = path.join(storagePath, 'workspace', 'app');
    const symlinkFilePath = path.join(symlinkFolderPath, 'target.txt');
    const downloadDestinationPath = path.join(
      storagePath,
      'download',
      'file.txt',
    );

    await mkdir(symlinkFolderPath, { recursive: true });
    await writeFile(outsideFilePath, 'outside');
    await symlink(outsideFilePath, symlinkFilePath);

    const driver = new LocalDriver({ storagePath });

    await expect(
      driver.downloadFile({
        onStoragePath: 'workspace/app/target.txt',
        localPath: downloadDestinationPath,
      }),
    ).rejects.toMatchObject({
      code: FileStorageExceptionCode.ACCESS_DENIED,
    });
  });
});
