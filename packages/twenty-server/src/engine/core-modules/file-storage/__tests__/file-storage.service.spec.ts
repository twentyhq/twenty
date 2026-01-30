import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Readable } from 'stream';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

describe('FileStorageService', () => {
  let service: FileStorageService;
  let fileStorageDriverFactory: FileStorageDriverFactory;

  const mockFileStorageDriverFactory = {
    getCurrentDriver: jest.fn(),
  };

  const mockFileRepository = {
    save: jest.fn(),
  };

  const mockApplicationRepository = {
    findOneOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: FileStorageDriverFactory,
          useValue: mockFileStorageDriverFactory,
        },
        {
          provide: getRepositoryToken(FileEntity),
          useValue: mockFileRepository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: mockApplicationRepository,
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
        writeFile: jest.fn(),
        readFile: jest.fn(),
        delete: jest.fn(),
        move: jest.fn(),
        copy: jest.fn(),
        downloadFolder: jest.fn(),
        uploadFolder: jest.fn(),
        checkFileExists: jest.fn(),
        checkFolderExists: jest.fn(),
      };

      mockFileStorageDriverFactory.getCurrentDriver.mockReturnValue(mockDriver);
    });

    describe('writeFile', () => {
      it('should delegate to the current driver', async () => {
        const writeParams = {
          file: Buffer.from('test content'),
          name: 'test.txt',
          folder: 'documents',
          mimeType: 'text/plain',
        };

        mockDriver.writeFile.mockResolvedValue(undefined);

        await service.writeFile(writeParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.writeFile).toHaveBeenCalledWith({
          filePath: 'documents/test.txt',
          sourceFile: writeParams.file,
          mimeType: 'text/plain',
        });
      });

      it('should handle write errors', async () => {
        const writeParams = {
          file: 'test content',
          name: 'test.txt',
          folder: 'documents',
          mimeType: 'text/plain',
        };

        const error = new Error('Write failed');

        mockDriver.writeFile.mockRejectedValue(error);

        await expect(service.writeFile(writeParams)).rejects.toThrow(
          'Write failed',
        );
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
      });
    });

    describe('readFile', () => {
      it('should delegate to the current driver', async () => {
        const readParams = {
          filePath: 'documents/test.txt',
        };

        const mockStream = new Readable();

        mockDriver.readFile.mockResolvedValue(mockStream);

        const result = await service.readFile(readParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.readFile).toHaveBeenCalledWith({
          filePath: 'documents/test.txt',
        });
        expect(result).toBe(mockStream);
      });

      it('should handle read errors', async () => {
        const readParams = {
          filePath: 'documents/test.txt',
        };

        const error = new Error('Read failed');

        mockDriver.readFile.mockRejectedValue(error);

        await expect(service.readFile(readParams)).rejects.toThrow(
          'Read failed',
        );
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
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

    describe('checkFileExists', () => {
      it('should delegate to the current driver and return true', async () => {
        const checkParams = {
          filePath: 'documents/test.txt',
        };

        mockDriver.checkFileExists.mockResolvedValue(true);

        const result = await service.checkFileExists(checkParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.checkFileExists).toHaveBeenCalledWith(checkParams);
        expect(result).toBe(true);
      });

      it('should delegate to the current driver and return false', async () => {
        const checkParams = {
          filePath: 'documents/nonexistent.txt',
        };

        mockDriver.checkFileExists.mockResolvedValue(false);

        const result = await service.checkFileExists(checkParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.checkFileExists).toHaveBeenCalledWith(checkParams);
        expect(result).toBe(false);
      });

      it('should handle checkFileExists errors', async () => {
        const checkParams = {
          filePath: 'documents/test.txt',
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

    describe('checkFolderExists', () => {
      it('should delegate to the current driver and return true', async () => {
        const checkParams = {
          folderPath: 'documents',
        };

        mockDriver.checkFolderExists.mockResolvedValue(true);

        const result = await service.checkFolderExists(checkParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.checkFolderExists).toHaveBeenCalledWith(checkParams);
        expect(result).toBe(true);
      });

      it('should delegate to the current driver and return false', async () => {
        const checkParams = {
          folderPath: 'nonexistent',
        };

        mockDriver.checkFolderExists.mockResolvedValue(false);

        const result = await service.checkFolderExists(checkParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.checkFolderExists).toHaveBeenCalledWith(checkParams);
        expect(result).toBe(false);
      });
    });
  });
});
