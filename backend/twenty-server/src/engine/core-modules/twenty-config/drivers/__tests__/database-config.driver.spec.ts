import { Test, type TestingModule } from '@nestjs/testing';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { DatabaseConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/database-config.driver';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';

jest.mock(
  'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util',
  () => ({
    isEnvOnlyConfigVar: jest.fn(),
  }),
);

const CONFIG_PASSWORD_KEY = 'AUTH_PASSWORD_ENABLED';
const CONFIG_EMAIL_KEY = 'EMAIL_FROM_ADDRESS';
const CONFIG_ENV_ONLY_KEY = 'ENV_ONLY_VAR';
const CONFIG_PORT_KEY = 'NODE_PORT';

class TestDatabaseConfigDriver extends DatabaseConfigDriver {
  public get testAllPossibleConfigKeys(): Array<keyof ConfigVariables> {
    return this['allPossibleConfigKeys'];
  }

  constructor(
    configCache: ConfigCacheService,
    configStorage: ConfigStorageService,
  ) {
    super(configCache, configStorage);

    Object.defineProperty(this, 'allPossibleConfigKeys', {
      value: [CONFIG_PASSWORD_KEY, CONFIG_EMAIL_KEY, CONFIG_PORT_KEY],
      writable: false,
      configurable: true,
    });
  }
}

describe('DatabaseConfigDriver', () => {
  let driver: TestDatabaseConfigDriver;
  let configCache: ConfigCacheService;
  let configStorage: ConfigStorageService;

  beforeEach(async () => {
    (isEnvOnlyConfigVar as jest.Mock).mockImplementation((key) => {
      return key === CONFIG_ENV_ONLY_KEY;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseConfigDriver,
          useClass: TestDatabaseConfigDriver,
        },
        {
          provide: ConfigCacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            clear: jest.fn(),
            clearAll: jest.fn(),
            isKeyKnownMissing: jest.fn(),
            markKeyAsMissing: jest.fn(),
            getCacheInfo: jest.fn(),
            getAllKeys: jest.fn(),
          },
        },
        {
          provide: ConfigStorageService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            loadAll: jest.fn(),
          },
        },
      ],
    }).compile();

    driver = module.get<TestDatabaseConfigDriver>(
      DatabaseConfigDriver,
    ) as TestDatabaseConfigDriver;
    configCache = module.get<ConfigCacheService>(ConfigCacheService);
    configStorage = module.get<ConfigStorageService>(ConfigStorageService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(driver).toBeDefined();
  });

  describe('initialization', () => {
    it('should have allPossibleConfigKeys properly set', () => {
      expect(driver.testAllPossibleConfigKeys).toContain(CONFIG_PASSWORD_KEY);
      expect(driver.testAllPossibleConfigKeys).toContain(CONFIG_EMAIL_KEY);
      expect(driver.testAllPossibleConfigKeys).not.toContain(
        CONFIG_ENV_ONLY_KEY,
      );
    });

    it('should initialize successfully with DB values and mark missing keys', async () => {
      const configVars = new Map();

      configVars.set(CONFIG_PASSWORD_KEY, true);

      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(configVars);

      await driver.onModuleInit();

      expect(configStorage.loadAll).toHaveBeenCalled();

      expect(configCache.set).toHaveBeenCalledWith(CONFIG_PASSWORD_KEY, true);

      expect(configCache.markKeyAsMissing).toHaveBeenCalledWith(
        CONFIG_EMAIL_KEY,
      );

      expect(configCache.markKeyAsMissing).not.toHaveBeenCalledWith(
        CONFIG_ENV_ONLY_KEY,
      );
    });

    it('should handle initialization failure gracefully', async () => {
      const error = new Error('DB error');

      jest.spyOn(configStorage, 'loadAll').mockRejectedValue(error);
      jest.spyOn(driver['logger'], 'error').mockImplementation();

      // Should not throw because we're handling errors internally now
      await driver.onModuleInit();

      expect(driver['logger'].error).toHaveBeenCalled();
      expect(configStorage.loadAll).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return cached value when available', async () => {
      const cachedValue = true;

      jest.spyOn(configCache, 'get').mockReturnValue(cachedValue);

      const result = driver.get(CONFIG_PASSWORD_KEY);

      expect(result).toBe(cachedValue);
      expect(configCache.get).toHaveBeenCalledWith(CONFIG_PASSWORD_KEY);
    });

    it('should return undefined when value is not in cache', async () => {
      jest.spyOn(configCache, 'get').mockReturnValue(undefined);

      const result = driver.get(CONFIG_PASSWORD_KEY);

      expect(result).toBeUndefined();
      expect(configCache.get).toHaveBeenCalledWith(CONFIG_PASSWORD_KEY);
    });

    it('should handle different config variable types correctly', () => {
      const stringValue = 'test@example.com';
      const booleanValue = true;
      const numberValue = 3000;

      jest.spyOn(configCache, 'get').mockImplementation((key) => {
        switch (key) {
          case CONFIG_EMAIL_KEY:
            return stringValue;
          case CONFIG_PASSWORD_KEY:
            return booleanValue;
          case CONFIG_PORT_KEY:
            return numberValue;
          default:
            return undefined;
        }
      });

      expect(driver.get(CONFIG_EMAIL_KEY)).toBe(stringValue);
      expect(driver.get(CONFIG_PASSWORD_KEY)).toBe(booleanValue);
      expect(driver.get(CONFIG_PORT_KEY)).toBe(numberValue);
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      (isEnvOnlyConfigVar as jest.Mock).mockReturnValue(false);
    });

    it('should update config in storage and cache', async () => {
      const value = true;

      await driver.update(CONFIG_PASSWORD_KEY, value);

      expect(configStorage.set).toHaveBeenCalledWith(
        CONFIG_PASSWORD_KEY,
        value,
      );
      expect(configCache.set).toHaveBeenCalledWith(CONFIG_PASSWORD_KEY, value);
    });

    it('should throw error when updating env-only variable', async () => {
      const value = true;

      (isEnvOnlyConfigVar as jest.Mock).mockReturnValue(true);

      await expect(driver.update(CONFIG_PASSWORD_KEY, value)).rejects.toThrow();
    });
  });

  describe('cache operations', () => {
    it('should return cache info', () => {
      const cacheInfo = {
        foundConfigValues: 2,
        knownMissingKeys: 1,
        cacheKeys: [CONFIG_PASSWORD_KEY, CONFIG_EMAIL_KEY],
      };

      jest.spyOn(configCache, 'getCacheInfo').mockReturnValue(cacheInfo);

      const result = driver.getCacheInfo();

      expect(result).toEqual(cacheInfo);
    });
  });

  describe('refreshAllCache', () => {
    it('should load all config values from DB', async () => {
      const dbValues = new Map();

      dbValues.set(CONFIG_PASSWORD_KEY, true);
      dbValues.set(CONFIG_EMAIL_KEY, 'test@example.com');

      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(dbValues);

      await driver.refreshAllCache();

      expect(configStorage.loadAll).toHaveBeenCalled();
      expect(configCache.set).toHaveBeenCalledWith(CONFIG_PASSWORD_KEY, true);
      expect(configCache.set).toHaveBeenCalledWith(
        CONFIG_EMAIL_KEY,
        'test@example.com',
      );
    });

    it('should not affect env-only variables when found in DB', async () => {
      const dbValues = new Map();

      dbValues.set(CONFIG_PASSWORD_KEY, true);
      dbValues.set(CONFIG_ENV_ONLY_KEY, 'env-value');

      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(dbValues);

      await driver.refreshAllCache();

      expect(configCache.set).toHaveBeenCalledWith(CONFIG_PASSWORD_KEY, true);

      expect(configCache.set).not.toHaveBeenCalledWith(
        CONFIG_ENV_ONLY_KEY,
        'env-value',
      );
    });

    it('should mark keys as missing when not found in DB', async () => {
      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(new Map());

      await driver.refreshAllCache();

      expect(configCache.markKeyAsMissing).toHaveBeenCalledWith(
        CONFIG_PASSWORD_KEY,
      );
      expect(configCache.markKeyAsMissing).toHaveBeenCalledWith(
        CONFIG_EMAIL_KEY,
      );

      expect(configCache.markKeyAsMissing).not.toHaveBeenCalledWith(
        CONFIG_ENV_ONLY_KEY,
      );
    });

    it('should properly handle mix of found and missing keys', async () => {
      const dbValues = new Map();

      dbValues.set(CONFIG_PASSWORD_KEY, true);

      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(dbValues);

      await driver.refreshAllCache();

      expect(configCache.set).toHaveBeenCalledWith(CONFIG_PASSWORD_KEY, true);

      expect(configCache.markKeyAsMissing).toHaveBeenCalledWith(
        CONFIG_EMAIL_KEY,
      );
    });

    it('should handle errors gracefully and verify cache remains unchanged', async () => {
      const error = new Error('Database error');

      jest.spyOn(configStorage, 'loadAll').mockRejectedValue(error);
      jest.spyOn(driver['logger'], 'error').mockImplementation();

      const mockCacheState = new Map();

      mockCacheState.set(CONFIG_PASSWORD_KEY, false);
      jest
        .spyOn(configCache, 'getAllKeys')
        .mockReturnValue([CONFIG_PASSWORD_KEY]);
      jest
        .spyOn(configCache, 'get')
        .mockImplementation((key) => mockCacheState.get(key));

      await driver.refreshAllCache();

      expect(driver['logger'].error).toHaveBeenCalled();
      expect(configStorage.loadAll).toHaveBeenCalled();

      expect(configCache.set).not.toHaveBeenCalled();
      expect(configCache.markKeyAsMissing).not.toHaveBeenCalled();
      expect(configCache.clear).not.toHaveBeenCalled();
      expect(configCache.clearAll).not.toHaveBeenCalled();
    });
  });
});
