import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
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
import { streamToBuffer } from 'src/utils/stream-to-buffer';

describe('LocalDriver', () => {
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

  describe('readFile', () => {
    it('should read only the requested byte range', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const folderPath = path.join(storagePath, 'workspace', 'app');

      await mkdir(folderPath, { recursive: true });
      await writeFile(path.join(folderPath, 'file.txt'), '0123456789');

      const driver = new LocalDriver({ storagePath });
      const stream = await driver.readFile({
        filePath: 'workspace/app/file.txt',
        byteRange: { startByte: 2, endByte: 5 },
      });

      await expect(streamToBuffer(stream)).resolves.toEqual(
        Buffer.from('2345'),
      );
    });
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

      await expect(
        readdir(path.join(storagePath, 'workspace/app')),
      ).resolves.toEqual([]);
    });

    it('should publish each write as a new object rather than rewriting in place', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const driver = new LocalDriver({ storagePath });
      const filePath = 'workspace/app/file.txt';

      await driver.writeFileStream({
        filePath,
        stream: Readable.from(Buffer.from('first')),
        mimeType: undefined,
      });

      const first = await stat(path.join(storagePath, filePath));

      await driver.writeFileStream({
        filePath,
        stream: Readable.from(Buffer.from('secnd')),
        mimeType: undefined,
      });

      const second = await stat(path.join(storagePath, filePath));

      // Same length, so only the identity distinguishes them: a rewrite in
      // place would keep the inode and leave a promotion unable to tell the
      // two versions apart.
      expect(second.size).toBe(first.size);
      expect(second.ino).not.toBe(first.ino);

      await expect(
        readdir(path.join(storagePath, 'workspace/app')),
      ).resolves.toEqual(['file.txt']);
    });
  });

  describe('readFilePrefix', () => {
    it('should read only the leading bytes', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const folderPath = path.join(storagePath, 'workspace', 'app');

      await mkdir(folderPath, { recursive: true });
      await writeFile(path.join(folderPath, 'file.txt'), '0123456789');

      const driver = new LocalDriver({ storagePath });

      await expect(
        driver.readFilePrefix({
          filePath: 'workspace/app/file.txt',
          byteCount: 4,
        }),
      ).resolves.toEqual(Buffer.from('0123'));
    });

    it('should return the whole file when it is shorter than requested', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const folderPath = path.join(storagePath, 'workspace', 'app');

      await mkdir(folderPath, { recursive: true });
      await writeFile(path.join(folderPath, 'file.txt'), '01');

      const driver = new LocalDriver({ storagePath });

      await expect(
        driver.readFilePrefix({
          filePath: 'workspace/app/file.txt',
          byteCount: 4,
        }),
      ).resolves.toEqual(Buffer.from('01'));
    });

    it('should reject a missing file with FILE_NOT_FOUND', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const driver = new LocalDriver({ storagePath });

      await expect(
        driver.readFilePrefix({
          filePath: 'workspace/app/missing.txt',
          byteCount: 4,
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.FILE_NOT_FOUND,
      });
    });
  });

  describe('move', () => {
    it('should refuse to move an object that changed since it was inspected', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const folderPath = path.join(storagePath, 'workspace', 'app');

      await mkdir(folderPath, { recursive: true });
      await writeFile(path.join(folderPath, 'file.txt'), 'original');

      const driver = new LocalDriver({ storagePath });
      const before = await driver.getFileMetadata({
        filePath: 'workspace/app/file.txt',
      });

      await writeFile(path.join(folderPath, 'file.txt'), 'replaced');

      await expect(
        driver.move({
          from: { folderPath: 'workspace/app', filename: 'file.txt' },
          to: { folderPath: 'workspace/app', filename: 'moved.txt' },
          ifMatchChecksum: before?.checksum,
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.PRECONDITION_FAILED,
      });
    });

    it('should move an object that still matches the inspected identity', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const folderPath = path.join(storagePath, 'workspace', 'app');

      await mkdir(folderPath, { recursive: true });
      await writeFile(path.join(folderPath, 'file.txt'), 'original');

      const driver = new LocalDriver({ storagePath });
      const before = await driver.getFileMetadata({
        filePath: 'workspace/app/file.txt',
      });

      await driver.move({
        from: { folderPath: 'workspace/app', filename: 'file.txt' },
        to: { folderPath: 'workspace/app', filename: 'moved.txt' },
        ifMatchChecksum: before?.checksum,
      });

      await expect(
        driver.checkFileExists({ filePath: 'workspace/app/moved.txt' }),
      ).resolves.toBe(true);
    });

    it('should report a missing source under a precondition as FILE_NOT_FOUND', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');

      await mkdir(path.join(storagePath, 'workspace', 'app'), {
        recursive: true,
      });

      const driver = new LocalDriver({ storagePath });

      await expect(
        driver.move({
          from: { folderPath: 'workspace/app', filename: 'missing.txt' },
          to: { folderPath: 'workspace/app', filename: 'moved.txt' },
          ifMatchChecksum: 'any-checksum',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.FILE_NOT_FOUND,
      });
    });

    it('should leave the source in place when the precondition fails', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');
      const folderPath = path.join(storagePath, 'workspace', 'app');

      await mkdir(folderPath, { recursive: true });
      await writeFile(path.join(folderPath, 'file.txt'), 'original');

      const driver = new LocalDriver({ storagePath });
      const before = await driver.getFileMetadata({
        filePath: 'workspace/app/file.txt',
      });

      await writeFile(path.join(folderPath, 'file.txt'), 'replaced');

      await expect(
        driver.move({
          from: { folderPath: 'workspace/app', filename: 'file.txt' },
          to: { folderPath: 'workspace/final', filename: 'moved.txt' },
          ifMatchChecksum: before?.checksum,
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.PRECONDITION_FAILED,
      });

      // A failed promotion must not strand the object under the private name
      // it was claimed with, where nothing would ever look for it again.
      await expect(readdir(folderPath)).resolves.toEqual(['file.txt']);
      await expect(
        readFile(path.join(folderPath, 'file.txt'), 'utf-8'),
      ).resolves.toBe('replaced');
    });

    it('should not report a storage failure as a missing source', async () => {
      const storagePath = await createTempDirectory('local-driver-storage-');

      await mkdir(path.join(storagePath, 'workspace'), { recursive: true });
      // A regular file where a directory is expected makes stat fail with
      // ENOTDIR, which root cannot bypass the way it bypasses mode bits.
      await writeFile(path.join(storagePath, 'workspace', 'blocker'), 'x');

      const driver = new LocalDriver({ storagePath });

      await expect(
        driver.move({
          from: { folderPath: 'workspace/blocker', filename: 'file.txt' },
          to: { folderPath: 'workspace/app', filename: 'moved.txt' },
          ifMatchChecksum: 'any-checksum',
        }),
      ).rejects.toMatchObject({ code: 'ENOTDIR' });
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
      ).resolves.toMatchObject({ size: 5 });
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
