import { Test, TestingModule } from '@nestjs/testing';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { DatabaseConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/database-config.driver';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConfigInitializationState } from 'src/engine/core-modules/twenty-config/enums/config-initialization-state.enum';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';

jest.mock('p-retry', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(async (fn) => fn()),
    AbortError: jest.requireActual('p-retry').AbortError,
  };
});

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
      expect(driver['configInitializationState']).toBe(
        ConfigInitializationState.INITIALIZED,
      );
    });

    it('should handle initialization failure', async () => {
      const error = new Error('DB error');

      jest.spyOn(configStorage, 'loadAll').mockRejectedValue(error);

      await driver.initialize();

      expect(driver['configInitializationState']).toBe(
        ConfigInitializationState.FAILED,
      );
    });

    it('should succeed after multiple failures', async () => {
      const pRetryMock = jest.requireMock('p-retry').default;

      pRetryMock.mockImplementationOnce(async (fn) => {
        try {
          return await fn();
        } catch (error) {
          try {
            return await fn();
          } catch (error) {
            return await fn();
          }
        }
      });

      const error = new Error('DB error');

      jest
        .spyOn(configStorage, 'loadAll')
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(new Map());

      jest.spyOn(driver['logger'], 'error');
      jest.spyOn(driver['logger'], 'log');

      await driver.initialize();

      expect(driver['configInitializationState']).toBe(
        ConfigInitializationState.INITIALIZED,
      );

      expect(configStorage.loadAll).toHaveBeenCalledTimes(3);
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

    it('should abort initialization when destroyed', async () => {
      jest.useFakeTimers();

      let rejectFn!: (reason?: any) => void;
      const pendingPromise = new Promise<
        Map<keyof ConfigVariables, ConfigVariables[keyof ConfigVariables]>
      >((_, reject) => {
        rejectFn = reject;
      });

      jest.spyOn(configStorage, 'loadAll').mockReturnValue(pendingPromise);

      const initPromise = driver.initialize();

      driver.onModuleDestroy();

      rejectFn(new Error('Aborted'));

      await initPromise;

      expect(driver['configInitializationState']).toBe(
        ConfigInitializationState.FAILED,
      );

      jest.useRealTimers();
    }, 10000);
  });

  describe('get', () => {
    beforeEach(async () => {
      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(new Map());
      await driver.initialize();
    });

    it('should use environment driver when not initialized', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const envValue = true;

      jest.spyOn(environmentDriver, 'get').mockReturnValue(envValue);
      driver['configInitializationState'] =
        ConfigInitializationState.NOT_INITIALIZED;

      const result = driver.get(key);

      expect(result).toBe(envValue);
      expect(environmentDriver.get).toHaveBeenCalledWith(key);
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

    it('should return cached value when available', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const cachedValue = true;

      jest.spyOn(configCache, 'get').mockReturnValue(cachedValue);

      const result = driver.get(key);

      expect(result).toBe(cachedValue);
      expect(configCache.get).toHaveBeenCalledWith(key);
    });

    it('should use environment driver when negative lookup is cached', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const envValue = true;

      jest.spyOn(configCache, 'get').mockReturnValue(undefined);
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

      jest.spyOn(configCache, 'get').mockReturnValue(undefined);
      jest.spyOn(configCache, 'isKeyKnownMissing').mockReturnValue(false);
      jest.spyOn(environmentDriver, 'get').mockReturnValue(envValue);

      const fetchSpy = jest
        .spyOn(driver, 'fetchAndCacheConfig')
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
            return stringValue;
          case booleanKey:
            return booleanValue;
          case numberKey:
            return numberValue;
          default:
            return undefined;
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

    it('should throw error when updating before initialization', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;

      driver['configInitializationState'] =
        ConfigInitializationState.NOT_INITIALIZED;

      await expect(driver.update(key, value)).rejects.toThrow();
    });
  });

  describe('fetchAndCacheConfig', () => {
    it('should refresh config from storage', async () => {
      const key = 'AUTH_PASSWORD_ENABLED';
      const value = true;

      jest.spyOn(configStorage, 'get').mockResolvedValue(value);

      await driver.fetchAndCacheConfig(key);

      expect(configStorage.get).toHaveBeenCalledWith(key);
      expect(configCache.set).toHaveBeenCalledWith(key, value);
    });

    it('should mark key as missing when value is undefined', async () => {
      const key = 'AUTH_PASSWORD_ENABLED';

      jest.spyOn(configStorage, 'get').mockResolvedValue(undefined);

      await driver.fetchAndCacheConfig(key);

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

      await driver.fetchAndCacheConfig(key);

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

    it('should use environment driver when not initialized', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const envValue = true;

      driver['configInitializationState'] =
        ConfigInitializationState.NOT_INITIALIZED;
      jest.spyOn(environmentDriver, 'get').mockReturnValue(envValue);

      const result = driver.get(key);

      expect(result).toBe(envValue);
      expect(environmentDriver.get).toHaveBeenCalledWith(key);
      expect(configCache.get).not.toHaveBeenCalled();
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

      jest.spyOn(configCache, 'get').mockReturnValue(undefined);
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

      driver['configInitializationState'] =
        ConfigInitializationState.NOT_INITIALIZED;
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
        .spyOn(driver, 'fetchAndCacheConfig')
        .mockReturnValue(fetchPromise);

      jest.spyOn(configStorage, 'loadAll').mockResolvedValue(new Map());
      await driver.initialize();

      const key = 'MISSING_KEY' as keyof ConfigVariables;

      jest.spyOn(configCache, 'get').mockReturnValue(undefined);
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
});
