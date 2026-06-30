import { Test, type TestingModule } from '@nestjs/testing';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

describe('ConfigCacheService', () => {
  let service: ConfigCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigCacheService],
    }).compile();

    service = module.get<ConfigCacheService>(ConfigCacheService);
  });

  afterEach(() => {
    service.onModuleDestroy();
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
      const numberKey = 'CACHE_STORAGE_TTL' as keyof ConfigVariables;

      service.set(booleanKey, true);
      service.set(stringKey, 'test@example.com');
      service.set(numberKey, 3600 * 24 * 7);

      expect(service.get(booleanKey)).toBe(true);
      expect(service.get(stringKey)).toBe('test@example.com');
      expect(service.get(numberKey)).toBe(3600 * 24 * 7);
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

  describe('getCacheInfo', () => {
    it('should return correct cache information', () => {
      const key1 = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const key2 = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;
      const key3 = 'CACHE_STORAGE_TTL' as keyof ConfigVariables;

      service.set(key1, true);
      service.set(key2, 'test@example.com');
      service.markKeyAsMissing(key3);

      const info = service.getCacheInfo();

      expect(info.foundConfigValues).toBe(2);
      expect(info.knownMissingKeys).toBe(1);
      expect(info.cacheKeys).toContain(key1);
      expect(info.cacheKeys).toContain(key2);
      expect(info.cacheKeys).not.toContain(key3);
      expect(service.isKeyKnownMissing(key3)).toBe(true);
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

      expect(cacheInfo.foundConfigValues).toBe(2);
      expect(cacheInfo.knownMissingKeys).toBe(1);
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

      expect(service.get(key)).toBeUndefined();
    });
  });

  describe('getAllKeys', () => {
    it('should return all keys from both positive and negative caches', () => {
      const positiveKey1 = 'POSITIVE_KEY1' as keyof ConfigVariables;
      const positiveKey2 = 'POSITIVE_KEY2' as keyof ConfigVariables;
      const negativeKey = 'NEGATIVE_KEY' as keyof ConfigVariables;

      // Set up keys
      service.set(positiveKey1, 'value1');
      service.set(positiveKey2, 'value2');
      service.markKeyAsMissing(negativeKey);

      const allKeys = service.getAllKeys();

      expect(allKeys).toContain(positiveKey1);
      expect(allKeys).toContain(positiveKey2);
      expect(allKeys).toContain(negativeKey);
    });

    it('should return empty array when no keys exist', () => {
      const allKeys = service.getAllKeys();

      expect(allKeys).toHaveLength(0);
    });

    it('should not have duplicates if a key somehow exists in both caches', () => {
      const key = 'DUPLICATE_KEY' as keyof ConfigVariables;

      // First add to positive cache
      service.set(key, 'value');

      // Then force it into negative cache (normally this would remove from positive)
      // We're bypassing normal behavior for testing edge cases
      service.addToMissingKeysForTesting(key);

      const allKeys = service.getAllKeys();

      // Should only appear once in the result
      expect(allKeys.filter((k) => k === key)).toHaveLength(1);
    });
  });
});
