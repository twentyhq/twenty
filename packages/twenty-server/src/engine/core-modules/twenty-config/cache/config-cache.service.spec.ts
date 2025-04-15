import { Test, TestingModule } from '@nestjs/testing';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_CACHE_TTL } from 'src/engine/core-modules/twenty-config/constants/config-variables-cache-ttl';

describe('ConfigCacheService', () => {
  let service: ConfigCacheService;
  let originalDateNow: () => number;

  beforeAll(() => {
    originalDateNow = Date.now;
  });

  afterAll(() => {
    global.Date.now = originalDateNow;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigCacheService],
    }).compile();

    service = module.get<ConfigCacheService>(ConfigCacheService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      // Mock Date.now to simulate time passing
      const originalNow = Date.now;

      Date.now = jest.fn(() => originalNow() + CONFIG_VARIABLES_CACHE_TTL + 1);

      const result = service.get(key);

      expect(result).toBeUndefined();

      // Restore Date.now
      Date.now = originalNow;
    });

    it('should not expire entries before TTL', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;

      service.set(key, value);

      // Mock Date.now to simulate time passing but less than TTL
      const originalNow = Date.now;

      Date.now = jest.fn(() => originalNow() + CONFIG_VARIABLES_CACHE_TTL - 1);

      const result = service.get(key);

      expect(result).toBe(value);

      // Restore Date.now
      Date.now = originalNow;
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
    });

    it('should not include expired entries in cache info', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      service.set(key, true);

      // Mock Date.now to simulate time passing
      const originalNow = Date.now;

      Date.now = jest.fn(() => originalNow() + CONFIG_VARIABLES_CACHE_TTL + 1);

      const info = service.getCacheInfo();

      expect(info.positiveEntries).toBe(0);
      expect(info.negativeEntries).toBe(0);
      expect(info.cacheKeys).toHaveLength(0);

      // Restore Date.now
      Date.now = originalNow;
    });
  });

  describe('module lifecycle', () => {
    it('should clean up interval on module destroy', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      service.onModuleDestroy();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('cache scavenging', () => {
    it('should remove expired entries during scavenging', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      service.set(key, true);

      // Mock Date.now to simulate time passing
      const currentTime = Date.now();

      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => currentTime + CONFIG_VARIABLES_CACHE_TTL + 1);

      // Trigger scavenging by getting the value
      const result = service.get(key);

      expect(result).toBeUndefined();
    });

    it('should not remove non-expired entries during scavenging', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      service.set(key, true);

      // Mock Date.now to simulate time passing but still within TTL
      const currentTime = Date.now();

      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => currentTime + CONFIG_VARIABLES_CACHE_TTL - 1);

      // Trigger scavenging by getting the value
      const result = service.get(key);

      expect(result).toBe(true);
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
