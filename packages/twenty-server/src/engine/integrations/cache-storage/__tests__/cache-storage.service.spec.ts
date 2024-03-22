import { Cache } from '@nestjs/cache-manager';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';

const cacheStorageNamespace = CacheStorageNamespace.Messaging;

describe('CacheStorageService', () => {
  let cacheStorageService: CacheStorageService;
  let cacheManagerMock: Partial<Cache>;

  beforeEach(() => {
    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
    };

    cacheStorageService = new CacheStorageService(
      cacheManagerMock as Cache,
      cacheStorageNamespace,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should call cacheManager.get with the correct namespaced key', async () => {
      const key = 'testKey';
      const namespacedKey = `${cacheStorageNamespace}:${key}`;

      await cacheStorageService.get(key);

      expect(cacheManagerMock.get).toHaveBeenCalledWith(namespacedKey);
    });

    it('should return the value returned by cacheManager.get', async () => {
      const key = 'testKey';
      const value = 'testValue';

      jest.spyOn(cacheManagerMock, 'get').mockResolvedValue(value);

      const result = await cacheStorageService.get(key);

      expect(result).toBe(value);
    });
  });

  describe('set', () => {
    it('should call cacheManager.set with the correct namespaced key, value, and optional ttl', async () => {
      const key = 'testKey';
      const value = 'testValue';
      const ttl = 60;
      const namespacedKey = `${cacheStorageNamespace}:${key}`;

      await cacheStorageService.set(key, value, ttl);

      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        namespacedKey,
        value,
        ttl,
      );
    });

    it('should not throw if cacheManager.set resolves successfully', async () => {
      const key = 'testKey';
      const value = 'testValue';
      const ttl = 60;

      jest.spyOn(cacheManagerMock, 'set').mockResolvedValue(undefined);

      await expect(
        cacheStorageService.set(key, value, ttl),
      ).resolves.not.toThrow();
    });
  });
});
