import { Test, TestingModule } from '@nestjs/testing';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { DatabaseConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/database-config.driver';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';

jest.mock(
  'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util',
  () => ({
    isEnvOnlyConfigVar: jest.fn(),
  }),
);

describe('DatabaseConfigDriver', () => {
  let driver: DatabaseConfigDriver;
  let configCache: ConfigCacheService;
  let configStorage: ConfigStorageService;
  let environmentDriver: EnvironmentConfigDriver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseConfigDriver,
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
            getExpiredKeys: jest.fn(),
          },
        },
        {
          provide: ConfigStorageService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            loadAll: jest.fn(),
            loadByKeys: jest.fn(),
          },
        },
        {
          provide: EnvironmentConfigDriver,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    driver = module.get<DatabaseConfigDriver>(DatabaseConfigDriver);
    configCache = module.get<ConfigCacheService>(ConfigCacheService);
    configStorage = module.get<ConfigStorageService>(ConfigStorageService);
    environmentDriver = module.get<EnvironmentConfigDriver>(
      EnvironmentConfigDriver,
    );

    jest.clearAllMocks();
    (isEnvOnlyConfigVar as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(driver).toBeDefined();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const configVars = new Map<
        keyof ConfigVariables,
        ConfigVariables[keyof ConfigVariables]
      >([
        ['AUTH_PASSWORD_ENABLED', true],
        ['EMAIL_FROM_ADDRESS', 'test@example.com'],
      ]);

      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(configVars);

      await driver.initialize();

      expect(configStorage.loadAll).toHaveBeenCalled();
      expect(configCache.set).toHaveBeenCalledTimes(2);
    });

    it('should handle initialization failure', async () => {
      const error = new Error('DB error');

      jest.spyOn(configStorage, 'loadAll').mockRejectedValue(error);
      jest.spyOn(driver['logger'], 'error');

      await expect(driver.initialize()).rejects.toThrow(error);

      expect(driver['logger'].error).toHaveBeenCalled();
    });

    it('should handle concurrent initialization calls', async () => {
      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(new Map());

      const promises = [
        driver.initialize(),
        driver.initialize(),
        driver.initialize(),
      ];

      await Promise.all(promises);

      expect(configStorage.loadAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(new Map());
      await driver.initialize();
    });

    it('should use environment driver for env-only variables', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const envValue = true;

      (isEnvOnlyConfigVar as jest.Mock).mockReturnValue(true);
      jest.spyOn(environmentDriver, 'get').mockReturnValue(envValue);

      const result = driver.get(key);

      expect(result).toBe(envValue);
      expect(environmentDriver.get).toHaveBeenCalledWith(key);
      expect(isEnvOnlyConfigVar).toHaveBeenCalledWith(key);
    });

    it('should return cached value when available and not stale', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const cachedValue = true;

      jest.spyOn(configCache, 'get').mockReturnValue({ value: cachedValue, isStale: false });

      const result = driver.get(key);

      expect(result).toBe(cachedValue);
      expect(configCache.get).toHaveBeenCalledWith(key);
    });

    it('should return cached value and schedule refresh when stale', async () => {
      jest.useFakeTimers();
      
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const cachedValue = true;

      jest.spyOn(configCache, 'get').mockReturnValue({ value: cachedValue, isStale: true });
      
      const fetchSpy = jest
        .spyOn(driver, 'fetchAndCacheConfigVariable')
        .mockResolvedValue();

      const result = driver.get(key);

      expect(result).toBe(cachedValue);
      
      // Run immediate callbacks
      jest.runAllTimers();
      
      expect(fetchSpy).toHaveBeenCalledWith(key);
    });

    it('should use environment driver when negative lookup is cached', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const envValue = true;

      jest.spyOn(configCache, 'get').mockReturnValue({ value: undefined, isStale: false });
      jest.spyOn(configCache, 'isKeyKnownMissing').mockReturnValue(true);
      jest.spyOn(environmentDriver, 'get').mockReturnValue(envValue);

      const result = driver.get(key);

      expect(result).toBe(envValue);
      expect(environmentDriver.get).toHaveBeenCalledWith(key);
    });

    it('should schedule refresh when cache misses and not known missing', async () => {
      jest.useFakeTimers();

      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const envValue = true;

      jest.spyOn(configCache, 'get').mockReturnValue({ value: undefined, isStale: false });
      jest.spyOn(configCache, 'isKeyKnownMissing').mockReturnValue(false);
      jest.spyOn(environmentDriver, 'get').mockReturnValue(envValue);

      const fetchSpy = jest
        .spyOn(driver, 'fetchAndCacheConfigVariable')
        .mockResolvedValue();

      const result = driver.get(key);

      expect(result).toBe(envValue);

      // Run immediate callbacks
      jest.runAllTimers();

      expect(fetchSpy).toHaveBeenCalledWith(key);
    });

    it('should handle different config variable types correctly', () => {
      const stringKey = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;
      const booleanKey = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const numberKey = 'NODE_PORT' as keyof ConfigVariables;

      const stringValue = 'test@example.com';
      const booleanValue = true;
      const numberValue = 3000;

      jest.spyOn(configCache, 'get').mockImplementation((key) => {
        switch (key) {
          case stringKey:
            return { value: stringValue, isStale: false };
          case booleanKey:
            return { value: booleanValue, isStale: false };
          case numberKey:
            return { value: numberValue, isStale: false };
          default:
            return { value: undefined, isStale: false };
        }
      });

      expect(driver.get(stringKey)).toBe(stringValue);
      expect(driver.get(booleanKey)).toBe(booleanValue);
      expect(driver.get(numberKey)).toBe(numberValue);
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(new Map());
      await driver.initialize();
      (isEnvOnlyConfigVar as jest.Mock).mockReturnValue(false);
    });

    it('should update config in storage and cache', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;

      await driver.update(key, value);

      expect(configStorage.set).toHaveBeenCalledWith(key, value);
      expect(configCache.set).toHaveBeenCalledWith(key, value);
    });

    it('should throw error when updating env-only variable', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;

      (isEnvOnlyConfigVar as jest.Mock).mockReturnValue(true);

      await expect(driver.update(key, value)).rejects.toThrow();
    });
  });

  describe('fetchAndCacheConfigVariable', () => {
    it('should refresh config variable from storage', async () => {
      const key = 'AUTH_PASSWORD_ENABLED';
      const value = true;

      jest.spyOn(configStorage, 'get').mockResolvedValue(value);

      await driver.fetchAndCacheConfigVariable(key);

      expect(configStorage.get).toHaveBeenCalledWith(key);
      expect(configCache.set).toHaveBeenCalledWith(key, value);
    });

    it('should mark key as missing when value is undefined', async () => {
      const key = 'AUTH_PASSWORD_ENABLED';

      jest.spyOn(configStorage, 'get').mockResolvedValue(undefined);

      await driver.fetchAndCacheConfigVariable(key);

      expect(configStorage.get).toHaveBeenCalledWith(key);
      expect(configCache.markKeyAsMissing).toHaveBeenCalledWith(key);
      expect(configCache.set).not.toHaveBeenCalled();
    });

    it('should mark key as missing when storage fetch fails', async () => {
      const key = 'AUTH_PASSWORD_ENABLED';
      const error = new Error('Storage error');

      jest.spyOn(configStorage, 'get').mockRejectedValue(error);
      const loggerSpy = jest
        .spyOn(driver['logger'], 'error')
        .mockImplementation();

      await driver.fetchAndCacheConfigVariable(key);

      expect(configStorage.get).toHaveBeenCalledWith(key);
      expect(configCache.markKeyAsMissing).toHaveBeenCalledWith(key);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch config'),
        error,
      );
    });
  });

  describe('cache operations', () => {
    it('should return cache info', () => {
      const cacheInfo = {
        positiveEntries: 2,
        negativeEntries: 1,
        cacheKeys: ['AUTH_PASSWORD_ENABLED', 'EMAIL_FROM_ADDRESS'],
      };

      jest.spyOn(configCache, 'getCacheInfo').mockReturnValue(cacheInfo);

      const result = driver.getCacheInfo();

      expect(result).toEqual(cacheInfo);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(new Map());
      await driver.initialize();
      (isEnvOnlyConfigVar as jest.Mock).mockReturnValue(false);
    });

    it('should handle storage service errors during update', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;
      const error = new Error('Storage error');

      jest.spyOn(configStorage, 'set').mockRejectedValue(error);
      const loggerSpy = jest
        .spyOn(driver['logger'], 'error')
        .mockImplementation();

      await expect(driver.update(key, value)).rejects.toThrow();
      expect(configCache.set).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update config'),
        error,
      );
    });

    it('should use environment driver for env-only variables', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const envValue = true;

      (isEnvOnlyConfigVar as jest.Mock).mockReturnValue(true);
      jest.spyOn(environmentDriver, 'get').mockReturnValue(envValue);

      const result = driver.get(key);

      expect(result).toBe(envValue);
      expect(environmentDriver.get).toHaveBeenCalledWith(key);
      expect(configCache.get).not.toHaveBeenCalled();
      expect(isEnvOnlyConfigVar).toHaveBeenCalledWith(key);
    });

    it('should use environment driver when negative lookup is cached', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const envValue = true;

      jest.spyOn(configCache, 'get').mockReturnValue({ value: undefined, isStale: false });
      jest.spyOn(configCache, 'isKeyKnownMissing').mockReturnValue(true);
      jest.spyOn(environmentDriver, 'get').mockReturnValue(envValue);

      const result = driver.get(key);

      expect(result).toBe(envValue);
      expect(environmentDriver.get).toHaveBeenCalledWith(key);
      expect(configCache.get).toHaveBeenCalledWith(key);
      expect(configCache.isKeyKnownMissing).toHaveBeenCalledWith(key);
    });

    it('should propagate cache service errors when no fallback conditions are met', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      jest.spyOn(configCache, 'get').mockImplementation(() => {
        throw new Error('Cache error');
      });

      expect(() => driver.get(key)).toThrow('Cache error');
      expect(configCache.get).toHaveBeenCalledWith(key);
      expect(environmentDriver.get).not.toHaveBeenCalled();
    });

    it('should propagate environment driver errors when using environment driver', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      (isEnvOnlyConfigVar as jest.Mock).mockReturnValue(true);
      jest.spyOn(environmentDriver, 'get').mockImplementation(() => {
        throw new Error('Environment error');
      });

      expect(() => driver.get(key)).toThrow('Environment error');
      expect(environmentDriver.get).toHaveBeenCalledWith(key);
    });
  });

  describe('background operations', () => {
    it('should schedule refresh in background', async () => {
      jest.useFakeTimers();

      const fetchPromise = Promise.resolve();
      const fetchSpy = jest
        .spyOn(driver, 'fetchAndCacheConfigVariable')
        .mockReturnValue(fetchPromise);

      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(new Map());
      await driver.initialize();

      const key = 'MISSING_KEY' as keyof ConfigVariables;

      jest.spyOn(configCache, 'get').mockReturnValue({ value: undefined, isStale: false });
      jest.spyOn(configCache, 'isKeyKnownMissing').mockReturnValue(false);

      driver.get(key);

      jest.runAllTimers();

      await fetchPromise;

      expect(fetchSpy).toHaveBeenCalledWith(key);

      jest.useRealTimers();
    });

    it('should correctly populate cache during initialization', async () => {
      const configVars = new Map<
        keyof ConfigVariables,
        ConfigVariables[keyof ConfigVariables]
      >([
        ['AUTH_PASSWORD_ENABLED', true],
        ['EMAIL_FROM_ADDRESS', 'test@example.com'],
        ['NODE_PORT', 3000],
      ]);

      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(configVars);

      await driver.initialize();

      expect(configCache.set).toHaveBeenCalledWith(
        'AUTH_PASSWORD_ENABLED',
        true,
      );
      expect(configCache.set).toHaveBeenCalledWith(
        'EMAIL_FROM_ADDRESS',
        'test@example.com',
      );
      expect(configCache.set).toHaveBeenCalledWith('NODE_PORT', 3000);
    });
  });

  describe('refreshExpiredCache', () => {
    beforeEach(() => {
      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(new Map());
      // Add loadByKeys mock
      jest.spyOn(configStorage, 'loadByKeys').mockResolvedValue(new Map());
      // Add getExpiredKeys mock
      jest.spyOn(configCache, 'getExpiredKeys').mockReturnValue([]);
    });

    it('should do nothing when there are no expired keys', async () => {
      jest.spyOn(configCache, 'getExpiredKeys').mockReturnValue([]);
      
      await driver.refreshExpiredCache();
      
      expect(configStorage.loadByKeys).not.toHaveBeenCalled();
    });

    it('should filter out env-only variables from expired keys', async () => {
      const expiredKeys = [
        'AUTH_PASSWORD_ENABLED',
        'ENV_ONLY_VAR',
        'EMAIL_FROM_ADDRESS',
      ] as Array<keyof ConfigVariables>;
      
      jest.spyOn(configCache, 'getExpiredKeys').mockReturnValue(expiredKeys);
      
      // Simulate one env-only var
      (isEnvOnlyConfigVar as jest.Mock).mockImplementation((key) => {
        return key === 'ENV_ONLY_VAR';
      });
      
      await driver.refreshExpiredCache();
      
      expect(configStorage.loadByKeys).toHaveBeenCalledWith([
        'AUTH_PASSWORD_ENABLED',
        'EMAIL_FROM_ADDRESS',
      ]);
    });

    it('should mark all keys as missing when no values are found', async () => {
      const expiredKeys = [
        'AUTH_PASSWORD_ENABLED',
        'EMAIL_FROM_ADDRESS',
      ] as Array<keyof ConfigVariables>;
      
      jest.spyOn(configCache, 'getExpiredKeys').mockReturnValue(expiredKeys);
      jest.spyOn(configStorage, 'loadByKeys').mockResolvedValue(new Map());
      
      await driver.refreshExpiredCache();
      
      expect(configCache.markKeyAsMissing).toHaveBeenCalledTimes(2);
      expect(configCache.markKeyAsMissing).toHaveBeenCalledWith('AUTH_PASSWORD_ENABLED');
      expect(configCache.markKeyAsMissing).toHaveBeenCalledWith('EMAIL_FROM_ADDRESS');
    });

    it('should update cache with refreshed values', async () => {
      const expiredKeys = [
        'AUTH_PASSWORD_ENABLED',
        'EMAIL_FROM_ADDRESS',
        'MISSING_KEY',
      ] as Array<keyof ConfigVariables>;
      
      const refreshedValues = new Map<
        keyof ConfigVariables,
        ConfigVariables[keyof ConfigVariables]
      >([
        ['AUTH_PASSWORD_ENABLED', true],
        ['EMAIL_FROM_ADDRESS', 'test@example.com'],
      ]);
      
      jest.spyOn(configCache, 'getExpiredKeys').mockReturnValue(expiredKeys);
      jest.spyOn(configStorage, 'loadByKeys').mockResolvedValue(refreshedValues);
      
      await driver.refreshExpiredCache();
      
      // Should set found values
      expect(configCache.set).toHaveBeenCalledWith('AUTH_PASSWORD_ENABLED', true);
      expect(configCache.set).toHaveBeenCalledWith('EMAIL_FROM_ADDRESS', 'test@example.com');
      
      // Should mark missing values as missing
      expect(configCache.markKeyAsMissing).toHaveBeenCalledWith('MISSING_KEY');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      jest.spyOn(configCache, 'getExpiredKeys').mockReturnValue(['AUTH_PASSWORD_ENABLED'] as Array<keyof ConfigVariables>);
      jest.spyOn(configStorage, 'loadByKeys').mockRejectedValue(error);
      jest.spyOn(driver['logger'], 'error');
      
      await driver.refreshExpiredCache();
      
      // Should log error and not throw
      expect(driver['logger'].error).toHaveBeenCalled();
    });
  });
});
