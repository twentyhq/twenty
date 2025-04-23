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

  describe('cache scavenging', () => {
    it('should have a public scavengeCache method', () => {
      expect(typeof service.scavengeConfigVariablesCache).toBe('function');

      const prototype = Object.getPrototypeOf(service);

      expect(
        Object.getOwnPropertyDescriptor(prototype, 'scavengeConfigVariablesCache'),
      ).toBeDefined();
    });

    it('should remove expired entries when scavengeCache is called', () => {
      const key = 'TEST_KEY' as keyof ConfigVariables;

      service.set(key, 'test');

      withMockedDate(CONFIG_VARIABLES_CACHE_TTL + 1, () => {
        service.scavengeConfigVariablesCache();

        expect(service.get(key).value).toBeUndefined();
      });
    });

    it('should not remove non-expired entries when scavengeCache is called', () => {
      const key = 'TEST_KEY' as keyof ConfigVariables;

      service.set(key, 'test');

      withMockedDate(CONFIG_VARIABLES_CACHE_TTL - 1, () => {
        service.scavengeConfigVariablesCache();

        expect(service.get(key).value).toBe('test');
      });
    });

    it('should handle multiple entries with different expiration times', () => {
      const expiredKey = 'EXPIRED_KEY' as keyof ConfigVariables;
      const validKey = 'VALID_KEY' as keyof ConfigVariables;

      withMockedDate(-CONFIG_VARIABLES_CACHE_TTL * 2, () => {
        service.set(expiredKey, 'expired-value');
      });

      service.set(validKey, 'valid-value');

      service.scavengeConfigVariablesCache();

      expect(service.get(expiredKey).value).toBeUndefined(),
        expect(service.get(validKey).value).toBe('valid-value');
    });

    it('should handle empty cache when scavenging', () => {
      service.clearAll();

      expect(() => service.scavengeConfigVariablesCache()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      const key = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;

      service.set(key, '');
      expect(service.get(key).value).toBe('');
    });

    it('should handle zero values', () => {
      const key = 'NODE_PORT' as keyof ConfigVariables;

      service.set(key, 0);
      expect(service.get(key).value).toBe(0);
    });

    it('should handle clearing non-existent keys', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      expect(() => service.clear(key)).not.toThrow();

      const otherKey = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;

      service.set(otherKey, 'test@example.com');
      service.clear(key);
      expect(service.get(otherKey).value).toBe('test@example.com');
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
