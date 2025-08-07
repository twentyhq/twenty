import { Test, type TestingModule } from '@nestjs/testing';

import { Readable } from 'stream';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';

describe('FileStorageService', () => {
  let service: FileStorageService;
  let fileStorageDriverFactory: FileStorageDriverFactory;

  const mockFileStorageDriverFactory = {
    getCurrentDriver: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: FileStorageDriverFactory,
          useValue: mockFileStorageDriverFactory,
        },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
    fileStorageDriverFactory = module.get<FileStorageDriverFactory>(
      FileStorageDriverFactory,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('storage operations', () => {
    let mockDriver: any;

    beforeEach(() => {
      mockDriver = {
        write: jest.fn(),
        read: jest.fn(),
        delete: jest.fn(),
        move: jest.fn(),
        copy: jest.fn(),
        download: jest.fn(),
        checkFileExists: jest.fn(),
      };

      mockFileStorageDriverFactory.getCurrentDriver.mockReturnValue(mockDriver);
    });

    describe('write', () => {
      it('should delegate to the current driver', async () => {
        const writeParams = {
          file: Buffer.from('test content'),
          name: 'test.txt',
          folder: 'documents',
          mimeType: 'text/plain',
        };

        mockDriver.write.mockResolvedValue(undefined);

        await service.write(writeParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.write).toHaveBeenCalledWith(writeParams);
      });

      it('should handle write errors', async () => {
        const writeParams = {
          file: 'test content',
          name: 'test.txt',
          folder: 'documents',
          mimeType: 'text/plain',
        };

        const error = new Error('Write failed');

        mockDriver.write.mockRejectedValue(error);

        await expect(service.write(writeParams)).rejects.toThrow(
          'Write failed',
        );
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.write).toHaveBeenCalledWith(writeParams);
      });
    });

    describe('read', () => {
      it('should delegate to the current driver', async () => {
        const readParams = {
          folderPath: 'documents',
          filename: 'test.txt',
        };

        const mockStream = new Readable();

        mockDriver.read.mockResolvedValue(mockStream);

        const result = await service.read(readParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.read).toHaveBeenCalledWith(readParams);
        expect(result).toBe(mockStream);
      });

      it('should handle read errors', async () => {
        const readParams = {
          folderPath: 'documents',
          filename: 'test.txt',
        };

        const error = new Error('Read failed');

        mockDriver.read.mockRejectedValue(error);

        await expect(service.read(readParams)).rejects.toThrow('Read failed');
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.read).toHaveBeenCalledWith(readParams);
      });
    });

    describe('delete', () => {
      it('should delegate to the current driver with filename', async () => {
        const deleteParams = {
          folderPath: 'documents',
          filename: 'test.txt',
        };

        mockDriver.delete.mockResolvedValue(undefined);

        await service.delete(deleteParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.delete).toHaveBeenCalledWith(deleteParams);
      });

      it('should delegate to the current driver without filename (delete folder)', async () => {
        const deleteParams = {
          folderPath: 'documents',
        };

        mockDriver.delete.mockResolvedValue(undefined);

        await service.delete(deleteParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.delete).toHaveBeenCalledWith(deleteParams);
      });

      it('should handle delete errors', async () => {
        const deleteParams = {
          folderPath: 'documents',
          filename: 'test.txt',
        };

        const error = new Error('Delete failed');

        mockDriver.delete.mockRejectedValue(error);

        await expect(service.delete(deleteParams)).rejects.toThrow(
          'Delete failed',
        );
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.delete).toHaveBeenCalledWith(deleteParams);
      });
    });

    describe('move', () => {
      it('should delegate to the current driver', async () => {
        const moveParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: 'archive', filename: 'archived-test.txt' },
        };

        mockDriver.move.mockResolvedValue(undefined);

        await service.move(moveParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.move).toHaveBeenCalledWith(moveParams);
      });

      it('should handle move errors', async () => {
        const moveParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: 'archive', filename: 'archived-test.txt' },
        };

        const error = new Error('Move failed');

        mockDriver.move.mockRejectedValue(error);

        await expect(service.move(moveParams)).rejects.toThrow('Move failed');
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.move).toHaveBeenCalledWith(moveParams);
      });
    });

    describe('copy', () => {
      it('should delegate to the current driver', async () => {
        const copyParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: 'backup', filename: 'test-backup.txt' },
        };

        mockDriver.copy.mockResolvedValue(undefined);

        await service.copy(copyParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.copy).toHaveBeenCalledWith(copyParams);
      });

      it('should handle copy errors', async () => {
        const copyParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: 'backup', filename: 'test-backup.txt' },
        };

        const error = new Error('Copy failed');

        mockDriver.copy.mockRejectedValue(error);

        await expect(service.copy(copyParams)).rejects.toThrow('Copy failed');
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.copy).toHaveBeenCalledWith(copyParams);
      });
    });

    describe('download', () => {
      it('should delegate to the current driver', async () => {
        const downloadParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: '/tmp', filename: 'downloaded-test.txt' },
        };

        mockDriver.download.mockResolvedValue(undefined);

        await service.download(downloadParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.download).toHaveBeenCalledWith(downloadParams);
      });

      it('should handle download errors', async () => {
        const downloadParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: '/tmp', filename: 'downloaded-test.txt' },
        };

        const error = new Error('Download failed');

        mockDriver.download.mockRejectedValue(error);

        await expect(service.download(downloadParams)).rejects.toThrow(
          'Download failed',
        );
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.download).toHaveBeenCalledWith(downloadParams);
      });
    });

    describe('checkFileExists', () => {
      it('should delegate to the current driver and return true', async () => {
        const checkParams = {
          folderPath: 'documents',
          filename: 'test.txt',
        };

        mockDriver.checkFileExists.mockResolvedValue(true);

        const result = await service.checkFileExists(checkParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.checkFileExists).toHaveBeenCalledWith(checkParams);
        expect(result).toBe(true);
      });

      it('should delegate to the current driver and return false', async () => {
        const checkParams = {
          folderPath: 'documents',
          filename: 'nonexistent.txt',
        };

        mockDriver.checkFileExists.mockResolvedValue(false);

        const result = await service.checkFileExists(checkParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.checkFileExists).toHaveBeenCalledWith(checkParams);
        expect(result).toBe(false);
      });

      it('should handle checkFileExists errors', async () => {
        const checkParams = {
          folderPath: 'documents',
          filename: 'test.txt',
        };

        const error = new Error('Check failed');

        mockDriver.checkFileExists.mockRejectedValue(error);

        await expect(service.checkFileExists(checkParams)).rejects.toThrow(
          'Check failed',
        );
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.checkFileExists).toHaveBeenCalledWith(checkParams);
      });
    });
  });
});
