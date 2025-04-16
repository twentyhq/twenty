import { Test, TestingModule } from '@nestjs/testing';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_CACHE_SCAVENGE_INTERVAL } from 'src/engine/core-modules/twenty-config/constants/config-variables-cache-scavenge-interval';
import { CONFIG_VARIABLES_CACHE_TTL } from 'src/engine/core-modules/twenty-config/constants/config-variables-cache-ttl';

describe('ConfigCacheService', () => {
  let service: ConfigCacheService;
  let setIntervalSpy: jest.SpyInstance;
  let clearIntervalSpy: jest.SpyInstance;

  const withMockedDate = (timeOffset: number, callback: () => void) => {
    const originalNow = Date.now;

    try {
      Date.now = jest.fn(() => originalNow() + timeOffset);
      callback();
    } finally {
      Date.now = originalNow;
    }
  };

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['setInterval', 'clearInterval'] });
    setIntervalSpy = jest.spyOn(global, 'setInterval');
    clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigCacheService],
    }).compile();

    service = module.get<ConfigCacheService>(ConfigCacheService);
  });

  afterEach(() => {
    service.onModuleDestroy();
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get and set', () => {
    it('should set and get a value from cache', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;

      service.set(key, value);
      const result = service.get(key);

      expect(result).toBe(value);
    });

    it('should return undefined for non-existent key', () => {
      const result = service.get(
        'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
      );

      expect(result).toBeUndefined();
    });

    it('should handle different value types', () => {
      const booleanKey = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const stringKey = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;
      const numberKey = 'NODE_PORT' as keyof ConfigVariables;

      service.set(booleanKey, true);
      service.set(stringKey, 'test@example.com');
      service.set(numberKey, 3000);

      expect(service.get(booleanKey)).toBe(true);
      expect(service.get(stringKey)).toBe('test@example.com');
      expect(service.get(numberKey)).toBe(3000);
    });
  });

  describe('negative lookup cache', () => {
    it('should set and get negative lookup', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      service.setNegativeLookup(key);
      const result = service.getNegativeLookup(key);

      expect(result).toBe(true);
    });

    it('should return false for non-existent negative lookup', () => {
      const result = service.getNegativeLookup(
        'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
      );

      expect(result).toBe(false);
    });

    it('should clear negative lookup when setting a value', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      service.setNegativeLookup(key);
      service.set(key, true);

      expect(service.getNegativeLookup(key)).toBe(false);
      expect(service.get(key)).toBe(true);
    });
  });

  describe('clear operations', () => {
    it('should clear specific key', () => {
      const key1 = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const key2 = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;

      service.set(key1, true);
      service.set(key2, 'test@example.com');
      service.clear(key1);

      expect(service.get(key1)).toBeUndefined();
      expect(service.get(key2)).toBe('test@example.com');
    });

    it('should clear all entries', () => {
      const key1 = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const key2 = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;

      service.set(key1, true);
      service.set(key2, 'test@example.com');
      service.clearAll();

      expect(service.get(key1)).toBeUndefined();
      expect(service.get(key2)).toBeUndefined();
    });
  });

  describe('cache expiration', () => {
    it('should expire entries after TTL', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;

      service.set(key, value);

      withMockedDate(CONFIG_VARIABLES_CACHE_TTL + 1, () => {
        const result = service.get(key);

        expect(result).toBeUndefined();
      });
    });

    it('should not expire entries before TTL', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;

      service.set(key, value);

      withMockedDate(CONFIG_VARIABLES_CACHE_TTL - 1, () => {
        const result = service.get(key);

        expect(result).toBe(value);
      });
    });
  });

  describe('getCacheInfo', () => {
    it('should return correct cache information', () => {
      const key1 = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const key2 = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;
      const key3 = 'NODE_PORT' as keyof ConfigVariables;

      service.set(key1, true);
      service.set(key2, 'test@example.com');
      service.setNegativeLookup(key3);

      const info = service.getCacheInfo();

      expect(info.positiveEntries).toBe(2);
      expect(info.negativeEntries).toBe(1);
      expect(info.cacheKeys).toContain(key1);
      expect(info.cacheKeys).toContain(key2);
      expect(info.cacheKeys).not.toContain(key3);
      expect(service.getNegativeLookup(key3)).toBe(true);
    });

    it('should not include expired entries in cache info', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      service.set(key, true);

      withMockedDate(CONFIG_VARIABLES_CACHE_TTL + 1, () => {
        const info = service.getCacheInfo();

        expect(info.positiveEntries).toBe(0);
        expect(info.negativeEntries).toBe(0);
        expect(info.cacheKeys).toHaveLength(0);
      });
    });
  });

  describe('module lifecycle', () => {
    it('should clean up interval on module destroy', () => {
      service.onModuleDestroy();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('cache scavenging', () => {
    beforeEach(() => {
      jest.useFakeTimers({ doNotFake: ['setInterval', 'clearInterval'] });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should set up scavenging interval on initialization', () => {
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        CONFIG_VARIABLES_CACHE_SCAVENGE_INTERVAL,
      );
    });

    it('should clean up interval on module destroy', () => {
      const intervalId = setIntervalSpy.mock.results[0].value;

      service.onModuleDestroy();
      expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
    });

    it('should automatically scavenge expired entries after interval', () => {
      const key1 = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const key2 = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;

      service.set(key1, true);
      service.set(key2, 'test@example.com');

      jest.advanceTimersByTime(CONFIG_VARIABLES_CACHE_TTL + 1);
      jest.advanceTimersByTime(CONFIG_VARIABLES_CACHE_SCAVENGE_INTERVAL);

      expect(service.get(key1)).toBeUndefined();
      expect(service.get(key2)).toBeUndefined();
    });

    it('should not remove non-expired entries after interval', () => {
      const key1 = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const key2 = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;

      service.set(key1, true);
      service.set(key2, 'test@example.com');

      jest.advanceTimersByTime(CONFIG_VARIABLES_CACHE_TTL - 1);

      expect(service.get(key1)).toBe(true);
      expect(service.get(key2)).toBe('test@example.com');
    });

    it('should scavenge multiple times when multiple intervals pass', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      service.set(key, true);

      jest.advanceTimersByTime(
        CONFIG_VARIABLES_CACHE_TTL +
          CONFIG_VARIABLES_CACHE_SCAVENGE_INTERVAL * 3,
      );

      expect(service.get(key)).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      const key = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;

      service.set(key, '');
      expect(service.get(key)).toBe('');
    });

    it('should handle zero values', () => {
      const key = 'NODE_PORT' as keyof ConfigVariables;

      service.set(key, 0);
      expect(service.get(key)).toBe(0);
    });

    it('should handle clearing non-existent keys', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      expect(() => service.clear(key)).not.toThrow();

      const otherKey = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;

      service.set(otherKey, 'test@example.com');
      service.clear(key);
      expect(service.get(otherKey)).toBe('test@example.com');
    });

    it('should handle empty cache operations', () => {
      expect(service.getCacheInfo()).toEqual({
        positiveEntries: 0,
        negativeEntries: 0,
        cacheKeys: [],
      });
    });
  });
});
