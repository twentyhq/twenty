import { Test, type TestingModule } from '@nestjs/testing';

import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces/file-storage.interface';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('FileStorageDriverFactory', () => {
  let factory: FileStorageDriverFactory;
  let twentyConfigService: TwentyConfigService;

  const mockTwentyConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageDriverFactory,
        {
          provide: TwentyConfigService,
          useValue: mockTwentyConfigService,
        },
      ],
    }).compile();

    factory = module.get<FileStorageDriverFactory>(FileStorageDriverFactory);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);

    jest.clearAllMocks();
  });

  describe('buildConfigKey', () => {
    it('should build config key for local storage', () => {
      const storagePath = '/tmp/storage';

      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.LOCAL;
          if (key === 'STORAGE_LOCAL_PATH') return storagePath;

          return undefined;
        });

      const result = factory['buildConfigKey']();

      expect(result).toBe(`local|${storagePath}`);
      expect(twentyConfigService.get).toHaveBeenCalledWith('STORAGE_TYPE');
      expect(twentyConfigService.get).toHaveBeenCalledWith(
        'STORAGE_LOCAL_PATH',
      );
    });

    it('should build config key for S3 storage', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue(StorageDriverType.S_3);
      jest
        .spyOn(factory as any, 'getConfigGroupHash')
        .mockReturnValue('s3-hash-123');

      const result = factory['buildConfigKey']();

      expect(result).toBe('s3|s3-hash-123');
      expect(twentyConfigService.get).toHaveBeenCalledWith('STORAGE_TYPE');
    });

    it('should throw error for unsupported storage type', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue('unsupported-type');

      expect(() => factory['buildConfigKey']()).toThrow(
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
          if (key === 'STORAGE_TYPE') return StorageDriverType.LOCAL;
          if (key === 'STORAGE_LOCAL_PATH') return storagePath;

          return undefined;
        });

      const driver = factory['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('LocalDriver');
    });

    it('should create S3Driver for S3 storage with access keys', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'STORAGE_TYPE':
              return StorageDriverType.S_3;
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

      const driver = factory['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('S3Driver');
    });

    it('should create S3Driver for S3 storage without access keys (using provider chain)', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'STORAGE_TYPE':
              return StorageDriverType.S_3;
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

      const driver = factory['createDriver']();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('S3Driver');
    });

    it('should throw error for invalid storage driver type', () => {
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('invalid-type');

      expect(() => factory['createDriver']()).toThrow(
        'Invalid storage driver type: invalid-type',
      );
    });
  });

  describe('getCurrentDriver', () => {
    it('should return current driver for local storage', () => {
      const storagePath = '/tmp/storage';

      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.LOCAL;
          if (key === 'STORAGE_LOCAL_PATH') return storagePath;

          return undefined;
        });

      const driver = factory.getCurrentDriver();

      expect(driver).toBeDefined();
      expect(driver.constructor.name).toBe('LocalDriver');
    });

    it('should reuse driver when config key unchanged', () => {
      const storagePath = '/tmp/storage';

      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.LOCAL;
          if (key === 'STORAGE_LOCAL_PATH') return storagePath;

          return undefined;
        });

      const driver1 = factory.getCurrentDriver();
      const driver2 = factory.getCurrentDriver();

      expect(driver1).toBe(driver2);
    });

    it('should create new driver when config key changes', () => {
      // First call with local storage
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.LOCAL;
          if (key === 'STORAGE_LOCAL_PATH') return '/tmp/storage1';

          return undefined;
        });

      const driver1 = factory.getCurrentDriver();

      // Second call with different local path
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.LOCAL;
          if (key === 'STORAGE_LOCAL_PATH') return '/tmp/storage2';

          return undefined;
        });

      const driver2 = factory.getCurrentDriver();

      expect(driver1).not.toBe(driver2);
      expect(driver1.constructor.name).toBe('LocalDriver');
      expect(driver2.constructor.name).toBe('LocalDriver');
    });

    it('should create new driver when switching from local to S3', () => {
      // First call with local storage
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.LOCAL;
          if (key === 'STORAGE_LOCAL_PATH') return '/tmp/storage';

          return undefined;
        });

      const driver1 = factory.getCurrentDriver();

      // Second call with S3 storage
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          switch (key) {
            case 'STORAGE_TYPE':
              return StorageDriverType.S_3;
            case 'STORAGE_S3_NAME':
              return 'test-bucket';
            case 'STORAGE_S3_ENDPOINT':
              return 'https://s3.amazonaws.com';
            case 'STORAGE_S3_REGION':
              return 'us-east-1';
            default:
              return undefined;
          }
        });
      jest
        .spyOn(factory as any, 'getConfigGroupHash')
        .mockReturnValue('s3-hash-123');

      const driver2 = factory.getCurrentDriver();

      expect(driver1).not.toBe(driver2);
      expect(driver1.constructor.name).toBe('LocalDriver');
      expect(driver2.constructor.name).toBe('S3Driver');
    });

    it('should throw error for unsupported storage type', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue('invalid-storage-type');

      expect(() => factory.getCurrentDriver()).toThrow(
        'Failed to build config key for FileStorageDriverFactory. Original error: Unsupported storage type: invalid-storage-type',
      );
    });

    it('should throw error when driver creation fails after valid config', () => {
      const storagePath = '/tmp/storage';

      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'STORAGE_TYPE') return StorageDriverType.LOCAL;
          if (key === 'STORAGE_LOCAL_PATH') return storagePath;

          return undefined;
        });

      jest.spyOn(factory as any, 'createDriver').mockImplementation(() => {
        throw new Error('Driver creation failed');
      });

      expect(() => factory.getCurrentDriver()).toThrow(
        'Failed to create driver for FileStorageDriverFactory with config key: local|/tmp/storage. Original error: Driver creation failed',
      );
    });
  });
});
