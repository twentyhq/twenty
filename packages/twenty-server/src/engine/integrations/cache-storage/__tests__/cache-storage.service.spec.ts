import { Cache } from '@nestjs/cache-manager';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';

const cacheStorageNamespace = CacheStorageNamespace.Messaging;

describe('CacheStorageService', () => {
  let cacheStorageService: CacheStorageService;
  let redisCacheStorageService: CacheStorageService;
  let cacheMock: Partial<Cache>;
  let redisCacheMock;

  beforeEach(() => {
    cacheMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    cacheStorageService = new CacheStorageService(
      cacheMock as Cache,
      cacheStorageNamespace,
    );

    redisCacheMock = {
      ...cacheMock,
      store: {
        client: {
          sPop: jest.fn(),
          sAdd: jest.fn(),
        },
      },
    };

    redisCacheStorageService = new CacheStorageService(
      redisCacheMock as any,
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

      expect(cacheMock.get).toHaveBeenCalledWith(namespacedKey);
    });

    it('should return the value returned by cacheManager.get', async () => {
      const key = 'testKey';
      const value = 'testValue';

      jest.spyOn(cacheMock, 'get').mockResolvedValue(value);

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

      expect(cacheMock.set).toHaveBeenCalledWith(namespacedKey, value, ttl);
    });

    it('should not throw if cacheManager.set resolves successfully', async () => {
      const key = 'testKey';
      const value = 'testValue';
      const ttl = 60;

      jest.spyOn(cacheMock, 'set').mockResolvedValue(undefined);

      await expect(
        cacheStorageService.set(key, value, ttl),
      ).resolves.not.toThrow();
    });
  });
  describe('del', () => {
    it('should call cacheManager.del with the correct namespaced key', async () => {
      const key = 'testKey';
      const namespacedKey = `${cacheStorageNamespace}:${key}`;

      await cacheStorageService.del(key);

      expect(cacheMock.del).toHaveBeenCalledWith(namespacedKey);
    });

    it('should not throw if cacheManager.del resolves successfully', async () => {
      const key = 'testKey';

      jest.spyOn(cacheMock, 'del').mockResolvedValue(undefined);

      await expect(cacheStorageService.del(key)).resolves.not.toThrow();
    });
  });

  describe('setAdd', () => {
    it('should call redis sAdd if using Redis cache', async () => {
      const key = 'testKey';
      const value = ['value1', 'value2'];

      jest
        .spyOn(redisCacheStorageService as any, 'isRedisCache')
        .mockReturnValue(true);

      await redisCacheStorageService.setAdd(key, value);

      expect(redisCacheMock.store.client.sAdd).toHaveBeenCalledWith(
        `${cacheStorageNamespace}:${key}`,
        value,
      );
    });

    it('should not call redis sAdd if not using Redis cache', async () => {
      const key = 'testKey';
      const value = ['value1', 'value2'];
      const existingValue = ['value3', 'value4'];
      const mergedValue = [...existingValue, ...value];

      jest
        .spyOn(cacheStorageService as any, 'isRedisCache')
        .mockReturnValue(false);
      jest.spyOn(cacheMock, 'get').mockResolvedValue(existingValue);
      jest.spyOn(cacheStorageService, 'set');

      await cacheStorageService.setAdd(key, value);

      expect(cacheStorageService.set).toHaveBeenCalledWith(key, mergedValue);
    });
  });

  describe('setPop', () => {
    it('should call redis sPop if using Redis cache', async () => {
      const key = 'testKey';
      const poppedValue = 'poppedValue';

      jest
        .spyOn(redisCacheStorageService as any, 'isRedisCache')
        .mockReturnValue(true);
      jest.spyOn(cacheMock, 'get').mockResolvedValue(redisCacheMock);

      const result = await redisCacheStorageService.setPop(key);

      expect(redisCacheMock.store.client.sPop).toHaveBeenCalledWith(
        `${cacheStorageNamespace}:${key}`,
      );
      expect(result).toBe(poppedValue);
    });

    it('should not call redis sPop if not using Redis cache', async () => {
      const key = 'testKey';
      const existingValue = ['value1', 'value2'];
      const poppedValue = 'value2';
      const updatedValue = ['value1'];

      jest
        .spyOn(cacheStorageService as any, 'isRedisCache')
        .mockReturnValue(false);
      jest.spyOn(cacheMock, 'get').mockResolvedValue(existingValue);
      jest.spyOn(cacheStorageService, 'set');

      const result = await cacheStorageService.setPop(key);

      expect(cacheStorageService.set).toHaveBeenCalledWith(key, updatedValue);
      expect(result).toBe(poppedValue);
    });
  });
});
