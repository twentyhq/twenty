import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  stat,
  symlink,
  writeFile,
} from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { Readable } from 'stream';

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

  describe('writeFileStream', () => {
    it('should write the streamed content to disk', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const driver = new LocalDriver({ storagePath });

      await driver.writeFileStream({
        filePath: 'workspace/app/streamed.txt',
        stream: Readable.from([
          Buffer.from('streamed-'),
          Buffer.from('content'),
        ]),
        mimeType: 'text/plain',
      });

      await expect(
        readFile(path.join(storagePath, 'workspace/app/streamed.txt'), 'utf8'),
      ).resolves.toBe('streamed-content');
    });

    it('should reject when target is a symlink', async () => {
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
        driver.writeFileStream({
          filePath: 'workspace/app/target.txt',
          stream: Readable.from([Buffer.from('new-content')]),
          mimeType: undefined,
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      });

      await expect(readFile(outsideFilePath, 'utf8')).resolves.toBe('outside');
    });

    it('should remove the partial file when the stream errors', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const driver = new LocalDriver({ storagePath });

      const failingStream = new Readable({
        read() {
          this.push(Buffer.from('partial'));
          this.destroy(new Error('stream interrupted'));
        },
      });

      await expect(
        driver.writeFileStream({
          filePath: 'workspace/app/partial.txt',
          stream: failingStream,
          mimeType: undefined,
        }),
      ).rejects.toThrow('stream interrupted');

      await expect(
        stat(path.join(storagePath, 'workspace/app/partial.txt')),
      ).rejects.toMatchObject({ code: 'ENOENT' });
    });
  });

  describe('getFileMetadata', () => {
    it('should return the file size', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const folderPath = path.join(storagePath, 'workspace', 'app');

      await mkdir(folderPath, { recursive: true });
      await writeFile(path.join(folderPath, 'file.txt'), '12345');

      const driver = new LocalDriver({ storagePath });

      await expect(
        driver.getFileMetadata({ filePath: 'workspace/app/file.txt' }),
      ).resolves.toEqual({ size: 5 });
    });

    it('should return null when the file does not exist', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const driver = new LocalDriver({ storagePath });

      await expect(
        driver.getFileMetadata({ filePath: 'workspace/app/missing.txt' }),
      ).resolves.toBeNull();
    });
  });

  describe('getPresignedUploadUrl', () => {
    it('should return null so callers fall back to the server endpoint', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const driver = new LocalDriver({ storagePath });

      await expect(driver.getPresignedUploadUrl()).resolves.toBeNull();
    });
  });
});
