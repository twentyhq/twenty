import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_CACHE_TTL } from 'src/engine/core-modules/twenty-config/constants/config-variables-cache-ttl';

describe('ConfigCacheService', () => {
  let service: ConfigCacheService;

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
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot()],
      providers: [ConfigCacheService],
    }).compile();

    service = module.get<ConfigCacheService>(ConfigCacheService);
  });

  afterEach(() => {
    service.onModuleDestroy();
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

      expect(result.value).toBe(value);
      expect(result.isStale).toBe(false);
    });

    it('should return undefined for non-existent key', () => {
      const result = service.get(
        'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
      );

      expect(result.value).toBeUndefined();
      expect(result.isStale).toBe(false);
    });

    it('should handle different value types', () => {
      const booleanKey = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const stringKey = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;
      const numberKey = 'NODE_PORT' as keyof ConfigVariables;

      service.set(booleanKey, true);
      service.set(stringKey, 'test@example.com');
      service.set(numberKey, 3000);

      expect(service.get(booleanKey).value).toBe(true);
      expect(service.get(stringKey).value).toBe('test@example.com');
      expect(service.get(numberKey).value).toBe(3000);
    });
  });

  describe('negative lookup cache', () => {
    it('should check if a negative cache entry exists', () => {
      const key = 'TEST_KEY' as keyof ConfigVariables;

      service.markKeyAsMissing(key);
      const result = service.isKeyKnownMissing(key);

      expect(result).toBe(true);
    });

    it('should return false for negative cache entry check when not in cache', () => {
      const key = 'NON_EXISTENT_KEY' as keyof ConfigVariables;

      const result = service.isKeyKnownMissing(key);

      expect(result).toBe(false);
    });

    it('should return false for negative cache entry check when expired', () => {
      const key = 'TEST_KEY' as keyof ConfigVariables;

      service.markKeyAsMissing(key);

      // Mock a date beyond the TTL
      jest.spyOn(Date, 'now').mockReturnValueOnce(Date.now() + 1000000);

      expect(service.isKeyKnownMissing(key)).toBe(false);
    });
  });

  describe('clear operations', () => {
    it('should clear specific key', () => {
      const key1 = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const key2 = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;

      service.set(key1, true);
      service.set(key2, 'test@example.com');
      service.clear(key1);

      expect(service.get(key1).value).toBeUndefined();
      expect(service.get(key2).value).toBe('test@example.com');
    });

    it('should clear all entries', () => {
      const key1 = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const key2 = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;

      service.set(key1, true);
      service.set(key2, 'test@example.com');
      service.clearAll();

      expect(service.get(key1).value).toBeUndefined();
      expect(service.get(key2).value).toBeUndefined();
    });
  });

  describe('cache expiration', () => {
    it('should mark entries as stale after TTL', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;

      service.set(key, value);

      withMockedDate(CONFIG_VARIABLES_CACHE_TTL + 1, () => {
        const result = service.get(key);

        expect(result.value).toBe(value);
        expect(result.isStale).toBe(true);
      });
    });

    it('should not mark entries as stale before TTL', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;

      service.set(key, value);

      withMockedDate(CONFIG_VARIABLES_CACHE_TTL - 1, () => {
        const result = service.get(key);

        expect(result.value).toBe(value);
        expect(result.isStale).toBe(false);
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
      service.markKeyAsMissing(key3);

      const info = service.getCacheInfo();

      expect(info.positiveEntries).toBe(2);
      expect(info.negativeEntries).toBe(1);
      expect(info.cacheKeys).toContain(key1);
      expect(info.cacheKeys).toContain(key2);
      expect(info.cacheKeys).not.toContain(key3);
      expect(service.isKeyKnownMissing(key3)).toBe(true);
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

    it('should properly count cache entries', () => {
      const key1 = 'KEY1' as keyof ConfigVariables;
      const key2 = 'KEY2' as keyof ConfigVariables;
      const key3 = 'KEY3' as keyof ConfigVariables;

      // Add some values to the cache
      service.set(key1, 'value1');
      service.set(key2, 'value2');
      service.markKeyAsMissing(key3);

      const cacheInfo = service.getCacheInfo();

      expect(cacheInfo.positiveEntries).toBe(2);
      expect(cacheInfo.negativeEntries).toBe(1);
      expect(cacheInfo.cacheKeys).toContain(key1);
      expect(cacheInfo.cacheKeys).toContain(key2);
      expect(service.isKeyKnownMissing(key3)).toBe(true);
    });
  });

  describe('module lifecycle', () => {
    it('should clear cache on module destroy', () => {
      const key = 'TEST_KEY' as keyof ConfigVariables;

      service.set(key, 'test');

      service.onModuleDestroy();

      expect(service.get(key).value).toBeUndefined();
    });
  });

  describe('getExpiredKeys', () => {
    it('should return expired keys from both positive and negative caches', () => {
      const expiredKey1 = 'EXPIRED_KEY1' as keyof ConfigVariables;
      const expiredKey2 = 'EXPIRED_KEY2' as keyof ConfigVariables;
      const expiredNegativeKey =
        'EXPIRED_NEGATIVE_KEY' as keyof ConfigVariables;

      // Set up keys that will expire
      service.set(expiredKey1, 'value1');
      service.set(expiredKey2, 'value2');
      service.markKeyAsMissing(expiredNegativeKey);

      // Make the above keys expire
      withMockedDate(CONFIG_VARIABLES_CACHE_TTL + 1, () => {
        // Add a fresh key after the time change
        const freshKey = 'FRESH_KEY' as keyof ConfigVariables;

        service.set(freshKey, 'value3');

        const expiredKeys = service.getExpiredKeys();

        expect(expiredKeys).toContain(expiredKey1);
        expect(expiredKeys).toContain(expiredKey2);
        expect(expiredKeys).toContain(expiredNegativeKey);
        expect(expiredKeys).not.toContain(freshKey);
      });
    });

    it('should return empty array when no keys are expired', () => {
      const key1 = 'KEY1' as keyof ConfigVariables;
      const key2 = 'KEY2' as keyof ConfigVariables;
      const negativeKey = 'NEGATIVE_KEY' as keyof ConfigVariables;

      service.set(key1, 'value1');
      service.set(key2, 'value2');
      service.markKeyAsMissing(negativeKey);

      const expiredKeys = service.getExpiredKeys();

      expect(expiredKeys).toHaveLength(0);
    });

    it('should not have duplicates if a key is in both caches', () => {
      const key = 'DUPLICATE_KEY' as keyof ConfigVariables;

      // Manually manipulate the caches to simulate a key in both caches
      service.set(key, 'value');
      service.markKeyAsMissing(key);

      withMockedDate(CONFIG_VARIABLES_CACHE_TTL + 1, () => {
        const expiredKeys = service.getExpiredKeys();

        // Should only appear once in the result
        expect(expiredKeys.filter((k) => k === key)).toHaveLength(1);
      });
    });
  });
});
