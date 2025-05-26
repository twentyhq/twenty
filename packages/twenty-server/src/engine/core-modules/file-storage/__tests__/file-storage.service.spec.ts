import { Test, TestingModule } from '@nestjs/testing';

import { Readable } from 'stream';

import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces/file-storage.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('FileStorageService', () => {
  let service: FileStorageService;
  let twentyConfigService: TwentyConfigService;

  const mockTwentyConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: TwentyConfigService,
          useValue: mockTwentyConfigService,
        },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildConfigKey', () => {
    it('should build config key for local storage', () => {
      const storagePath = '/tmp/storage';

      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.Local;
          if (key === 'STORAGE_LOCAL_PATH') return storagePath;

          return undefined;
        });

      const configKey = service['buildConfigKey']();

      expect(configKey).toBe(`local|${storagePath}`);
      expect(twentyConfigService.get).toHaveBeenCalledWith('STORAGE_TYPE');
      expect(twentyConfigService.get).toHaveBeenCalledWith(
        'STORAGE_LOCAL_PATH',
      );
    });

    it('should build config key for S3 storage', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.S3;

          return 'mock-value';
        });

      // Mock the getConfigGroupHash method
      jest
        .spyOn(service as any, 'getConfigGroupHash')
        .mockReturnValue('abc123');

      const configKey = service['buildConfigKey']();

      expect(configKey).toBe('s3|abc123');
      expect(twentyConfigService.get).toHaveBeenCalledWith('STORAGE_TYPE');
    });

    it('should throw error for unsupported storage type', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue('unsupported-type');

      expect(() => service['buildConfigKey']()).toThrow(
        'Unsupported storage type: unsupported-type',
      );
    });
  });

  describe('createDriver', () => {
    it('should create LocalDriver for local storage', () => {
      const storagePath = '/tmp/storage';

      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.Local;
          if (key === 'STORAGE_LOCAL_PATH') return storagePath;

          return undefined;
        });

      const driver = service['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('LocalDriver');
    });

    it('should create S3Driver for S3 storage with access keys', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'STORAGE_TYPE':
              return StorageDriverType.S3;
            case 'STORAGE_S3_NAME':
              return 'test-bucket';
            case 'STORAGE_S3_ENDPOINT':
              return 'https://s3.amazonaws.com';
            case 'STORAGE_S3_REGION':
              return 'us-east-1';
            case 'STORAGE_S3_ACCESS_KEY_ID':
              return 'test-access-key';
            case 'STORAGE_S3_SECRET_ACCESS_KEY':
              return 'test-secret-key';
            default:
              return undefined;
          }
        });

      const driver = service['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('S3Driver');
    });

    it('should create S3Driver for S3 storage without access keys (using provider chain)', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'STORAGE_TYPE':
              return StorageDriverType.S3;
            case 'STORAGE_S3_NAME':
              return 'test-bucket';
            case 'STORAGE_S3_ENDPOINT':
              return 'https://s3.amazonaws.com';
            case 'STORAGE_S3_REGION':
              return 'us-east-1';
            case 'STORAGE_S3_ACCESS_KEY_ID':
              return undefined;
            case 'STORAGE_S3_SECRET_ACCESS_KEY':
              return undefined;
            default:
              return undefined;
          }
        });

      const driver = service['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('S3Driver');
    });

    it('should throw error for invalid storage driver type', () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('invalid-type');

      expect(() => service['createDriver']()).toThrow(
        'Invalid storage driver type: invalid-type',
      );
    });
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

      // Mock getCurrentDriver to return our mock driver
      jest
        .spyOn(service as any, 'getCurrentDriver')
        .mockReturnValue(mockDriver);
    });

    describe('write', () => {
      it('should call driver write method with correct parameters', async () => {
        const writeParams = {
          file: Buffer.from('test content'),
          name: 'test.txt',
          folder: 'documents',
          mimeType: 'text/plain',
        };

        mockDriver.write.mockResolvedValue(undefined);

        await service.write(writeParams);

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
      });
    });

    describe('read', () => {
      it('should call driver read method with correct parameters', async () => {
        const readParams = {
          folderPath: 'documents',
          filename: 'test.txt',
        };

        const mockStream = new Readable();

        mockDriver.read.mockResolvedValue(mockStream);

        const result = await service.read(readParams);

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
      });
    });

    describe('delete', () => {
      it('should call driver delete method with filename', async () => {
        const deleteParams = {
          folderPath: 'documents',
          filename: 'test.txt',
        };

        mockDriver.delete.mockResolvedValue(undefined);

        await service.delete(deleteParams);

        expect(mockDriver.delete).toHaveBeenCalledWith(deleteParams);
      });

      it('should call driver delete method without filename (delete folder)', async () => {
        const deleteParams = {
          folderPath: 'documents',
        };

        mockDriver.delete.mockResolvedValue(undefined);

        await service.delete(deleteParams);

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
      });
    });

    describe('move', () => {
      it('should call driver move method with correct parameters', async () => {
        const moveParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: 'archive', filename: 'archived-test.txt' },
        };

        mockDriver.move.mockResolvedValue(undefined);

        await service.move(moveParams);

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
      });
    });

    describe('copy', () => {
      it('should call driver copy method with correct parameters', async () => {
        const copyParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: 'backup', filename: 'test-backup.txt' },
        };

        mockDriver.copy.mockResolvedValue(undefined);

        await service.copy(copyParams);

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
      });
    });

    describe('download', () => {
      it('should call driver download method with correct parameters', async () => {
        const downloadParams = {
          from: { folderPath: 'documents', filename: 'test.txt' },
          to: { folderPath: '/tmp', filename: 'downloaded-test.txt' },
        };

        mockDriver.download.mockResolvedValue(undefined);

        await service.download(downloadParams);

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
      });
    });

    describe('checkFileExists', () => {
      it('should call driver checkFileExists method and return true', async () => {
        const checkParams = {
          folderPath: 'documents',
          filename: 'test.txt',
        };

        mockDriver.checkFileExists.mockResolvedValue(true);

        const result = await service.checkFileExists(checkParams);

        expect(mockDriver.checkFileExists).toHaveBeenCalledWith(checkParams);
        expect(result).toBe(true);
      });

      it('should call driver checkFileExists method and return false', async () => {
        const checkParams = {
          folderPath: 'documents',
          filename: 'nonexistent.txt',
        };

        mockDriver.checkFileExists.mockResolvedValue(false);

        const result = await service.checkFileExists(checkParams);

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
      });
    });
  });

  describe('driver caching and switching', () => {
    it('should cache driver and reuse when config key is the same', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.Local;
          if (key === 'STORAGE_LOCAL_PATH') return '/tmp/storage';

          return undefined;
        });

      const createDriverSpy = jest.spyOn(service as any, 'createDriver');

      // First call should create driver
      const driver1 = service['getCurrentDriver']();

      expect(createDriverSpy).toHaveBeenCalledTimes(1);

      // Second call should reuse cached driver
      const driver2 = service['getCurrentDriver']();

      expect(createDriverSpy).toHaveBeenCalledTimes(1);
      expect(driver1).toBe(driver2);
    });

    it('should create new driver when config key changes', () => {
      let storagePath = '/tmp/storage1';

      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.Local;
          if (key === 'STORAGE_LOCAL_PATH') return storagePath;

          return undefined;
        });

      const createDriverSpy = jest.spyOn(service as any, 'createDriver');
      const cleanupDriverSpy = jest.spyOn(service as any, 'cleanupDriver');

      // First call
      const driver1 = service['getCurrentDriver']();

      expect(createDriverSpy).toHaveBeenCalledTimes(1);

      // Change config
      storagePath = '/tmp/storage2';

      // Second call should create new driver and cleanup old one
      const driver2 = service['getCurrentDriver']();

      expect(createDriverSpy).toHaveBeenCalledTimes(2);
      expect(cleanupDriverSpy).toHaveBeenCalledTimes(1);
      expect(cleanupDriverSpy).toHaveBeenCalledWith(driver1);
      expect(driver1).not.toBe(driver2);
    });

    it('should throw error if driver creation fails', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue('invalid-storage-type');

      expect(() => service['getCurrentDriver']()).toThrow(
        'Unsupported storage type: invalid-storage-type',
      );
    });

    it('should throw error if createDriver fails after valid config', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.Local;
          if (key === 'STORAGE_LOCAL_PATH') return '/tmp/storage';

          return undefined;
        });

      jest.spyOn(service as any, 'createDriver').mockImplementation(() => {
        throw new Error('Driver creation failed');
      });

      expect(() => service['getCurrentDriver']()).toThrow(
        'Failed to create driver for FileStorageService with config key: local|/tmp/storage. Original error: Driver creation failed',
      );
    });
  });
});
