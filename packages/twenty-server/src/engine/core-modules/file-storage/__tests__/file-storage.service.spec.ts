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

    describe('writeFileLegacy', () => {
      it('should delegate to the current driver', async () => {
        const writeParams = {
          file: Buffer.from('test content'),
          name: 'test.txt',
          folder: 'documents',
          mimeType: 'text/plain',
        };

        mockDriver.writeFile.mockResolvedValue(undefined);

        await service.writeFileLegacy(writeParams);

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

        await expect(service.writeFileLegacy(writeParams)).rejects.toThrow(
          'Write failed',
        );
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
      });
    });

    describe('readFileLegacy', () => {
      it('should delegate to the current driver', async () => {
        const readParams = {
          filePath: 'documents/test.txt',
        };

        const mockStream = new Readable();

        mockDriver.readFile.mockResolvedValue(mockStream);

        const result = await service.readFileLegacy(readParams);

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

        await expect(service.readFileLegacy(readParams)).rejects.toThrow(
          'Read failed',
        );
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
      });
    });

    describe('deleteLegacy', () => {
      it('should delegate to the current driver with filename', async () => {
        const deleteParams = {
          folderPath: 'documents',
          filename: 'test.txt',
        };

        mockDriver.delete.mockResolvedValue(undefined);

        await service.deleteLegacy(deleteParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.delete).toHaveBeenCalledWith(deleteParams);
      });

      it('should delegate to the current driver without filename (delete folder)', async () => {
        const deleteParams = {
          folderPath: 'documents',
        };

        mockDriver.delete.mockResolvedValue(undefined);

        await service.deleteLegacy(deleteParams);

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

        await expect(service.deleteLegacy(deleteParams)).rejects.toThrow(
          'Delete failed',
        );
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.delete).toHaveBeenCalledWith(deleteParams);
      });
    });

    describe('copyLegacy', () => {
      it('should delegate to the current driver', async () => {
        const copyParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: 'backup', filename: 'test-backup.txt' },
        };

        mockDriver.copy.mockResolvedValue(undefined);

        await service.copyLegacy(copyParams);

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

        await expect(service.copyLegacy(copyParams)).rejects.toThrow(
          'Copy failed',
        );
        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.copy).toHaveBeenCalledWith(copyParams);
      });
    });

    describe('checkFolderExistsLegacy', () => {
      it('should delegate to the current driver and return true', async () => {
        const checkParams = {
          folderPath: 'documents',
        };

        mockDriver.checkFolderExists.mockResolvedValue(true);

        const result = await service.checkFolderExistsLegacy(checkParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.checkFolderExists).toHaveBeenCalledWith(checkParams);
        expect(result).toBe(true);
      });

      it('should delegate to the current driver and return false', async () => {
        const checkParams = {
          folderPath: 'nonexistent',
        };

        mockDriver.checkFolderExists.mockResolvedValue(false);

        const result = await service.checkFolderExistsLegacy(checkParams);

        expect(fileStorageDriverFactory.getCurrentDriver).toHaveBeenCalled();
        expect(mockDriver.checkFolderExists).toHaveBeenCalledWith(checkParams);
        expect(result).toBe(false);
      });
    });
  });
});
