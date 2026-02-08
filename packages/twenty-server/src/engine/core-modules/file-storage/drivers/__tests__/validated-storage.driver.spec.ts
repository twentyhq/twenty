import { Readable } from 'stream';

import { type StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';
import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { ValidatedStorageDriver } from 'src/engine/core-modules/file-storage/drivers/validated-storage.driver';

const createMockDriver = (): jest.Mocked<StorageDriver> => ({
  readFile: jest.fn().mockResolvedValue(Readable.from([])),
  writeFile: jest.fn().mockResolvedValue(undefined),
  downloadFolder: jest.fn().mockResolvedValue(undefined),
  uploadFolder: jest.fn().mockResolvedValue(undefined),
  downloadFile: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  move: jest.fn().mockResolvedValue(undefined),
  copy: jest.fn().mockResolvedValue(undefined),
  checkFileExists: jest.fn().mockResolvedValue(true),
  checkFolderExists: jest.fn().mockResolvedValue(true),
});

describe('ValidatedStorageDriver', () => {
  let mockDelegate: jest.Mocked<StorageDriver>;
  let driver: ValidatedStorageDriver;

  beforeEach(() => {
    mockDelegate = createMockDriver();
    driver = new ValidatedStorageDriver(mockDelegate);
  });

  describe('delegates to the underlying driver for safe paths', () => {
    it('should delegate readFile', async () => {
      await driver.readFile({ filePath: 'folder/file.txt' });

      expect(mockDelegate.readFile).toHaveBeenCalledWith({
        filePath: 'folder/file.txt',
      });
    });

    it('should delegate writeFile', async () => {
      const params = {
        filePath: 'folder/file.txt',
        sourceFile: Buffer.from('data'),
        mimeType: 'text/plain' as string | undefined,
      };

      await driver.writeFile(params);

      expect(mockDelegate.writeFile).toHaveBeenCalledWith(params);
    });

    it('should delegate downloadFolder', async () => {
      await driver.downloadFolder({
        onStoragePath: 'folder',
        localPath: '/tmp/local',
      });

      expect(mockDelegate.downloadFolder).toHaveBeenCalledWith({
        onStoragePath: 'folder',
        localPath: '/tmp/local',
      });
    });

    it('should delegate uploadFolder', async () => {
      await driver.uploadFolder({
        localPath: '/tmp/local',
        onStoragePath: 'folder',
      });

      expect(mockDelegate.uploadFolder).toHaveBeenCalledWith({
        localPath: '/tmp/local',
        onStoragePath: 'folder',
      });
    });

    it('should delegate delete', async () => {
      await driver.delete({ folderPath: 'folder', filename: 'file.txt' });

      expect(mockDelegate.delete).toHaveBeenCalledWith({
        folderPath: 'folder',
        filename: 'file.txt',
      });
    });

    it('should delegate move', async () => {
      const params = {
        from: { folderPath: 'a', filename: 'f1.txt' },
        to: { folderPath: 'b', filename: 'f2.txt' },
      };

      await driver.move(params);

      expect(mockDelegate.move).toHaveBeenCalledWith(params);
    });

    it('should delegate copy', async () => {
      const params = {
        from: { folderPath: 'a', filename: 'f1.txt' },
        to: { folderPath: 'b', filename: 'f2.txt' },
      };

      await driver.copy(params);

      expect(mockDelegate.copy).toHaveBeenCalledWith(params);
    });

    it('should delegate checkFileExists', async () => {
      await driver.checkFileExists({ filePath: 'folder/file.txt' });

      expect(mockDelegate.checkFileExists).toHaveBeenCalledWith({
        filePath: 'folder/file.txt',
      });
    });

    it('should delegate checkFolderExists', async () => {
      await driver.checkFolderExists({ folderPath: 'folder' });

      expect(mockDelegate.checkFolderExists).toHaveBeenCalledWith({
        folderPath: 'folder',
      });
    });
  });

  describe('rejects path traversal attempts', () => {
    it('should reject readFile with traversal', async () => {
      await expect(
        driver.readFile({ filePath: '../etc/passwd' }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      });

      expect(mockDelegate.readFile).not.toHaveBeenCalled();
    });

    it('should reject writeFile with traversal', async () => {
      await expect(
        driver.writeFile({
          filePath: '../../evil',
          sourceFile: Buffer.from('x'),
          mimeType: undefined,
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      });

      expect(mockDelegate.writeFile).not.toHaveBeenCalled();
    });

    it('should reject delete with traversal in folderPath', async () => {
      await expect(
        driver.delete({ folderPath: '../secret' }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      });

      expect(mockDelegate.delete).not.toHaveBeenCalled();
    });

    it('should reject delete with traversal in filename', async () => {
      await expect(
        driver.delete({ folderPath: 'folder', filename: '../../etc/passwd' }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      });

      expect(mockDelegate.delete).not.toHaveBeenCalled();
    });

    it('should reject move with traversal', async () => {
      await expect(
        driver.move({
          from: { folderPath: '../secret' },
          to: { folderPath: 'dest' },
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      });

      expect(mockDelegate.move).not.toHaveBeenCalled();
    });

    it('should reject copy with traversal', async () => {
      await expect(
        driver.copy({
          from: { folderPath: 'src' },
          to: { folderPath: '../../etc' },
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      });

      expect(mockDelegate.copy).not.toHaveBeenCalled();
    });

    it('should reject downloadFolder with traversal', async () => {
      await expect(
        driver.downloadFolder({
          onStoragePath: '../../../etc',
          localPath: '/tmp/local',
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.ACCESS_DENIED,
      });

      expect(mockDelegate.downloadFolder).not.toHaveBeenCalled();
    });
  });

  describe('does NOT validate localPath parameters', () => {
    it('should allow absolute localPath in downloadFolder', async () => {
      await driver.downloadFolder({
        onStoragePath: 'folder',
        localPath: '/tmp/any-path',
      });

      expect(mockDelegate.downloadFolder).toHaveBeenCalled();
    });

    it('should allow absolute localPath in uploadFolder', async () => {
      await driver.uploadFolder({
        localPath: '/tmp/any-path',
        onStoragePath: 'folder',
      });

      expect(mockDelegate.uploadFolder).toHaveBeenCalled();
    });

    it('should allow absolute localPath in downloadFile', async () => {
      await driver.downloadFile({
        onStoragePath: 'folder/file.txt',
        localPath: '/tmp/any-path',
      });

      expect(mockDelegate.downloadFile).toHaveBeenCalled();
    });
  });
});
