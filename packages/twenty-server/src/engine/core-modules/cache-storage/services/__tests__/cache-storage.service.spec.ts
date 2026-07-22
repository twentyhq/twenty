import { type Cache } from '@nestjs/cache-manager';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const prefixKey = (key: string) =>
  `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:${key}`;

describe('CacheStorageService', () => {
  describe('mset', () => {
    const createRedisCacheMock = () => {
      const storeMset = jest.fn().mockResolvedValue(undefined);
      const cache = {
        store: { name: 'redis', mset: storeMset },
        set: jest.fn(),
      } as unknown as Cache;

      return { cache, storeMset };
    };

    it('commits all same-ttl entries in a single atomic store call', async () => {
      const { cache, storeMset } = createRedisCacheMock();
      const cacheStorageService = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineWorkspace,
      );

      await cacheStorageService.mset<unknown>([
        { key: 'flat-maps:field-metadata:workspace-id:hash', value: 'hash-1' },
        {
          key: 'flat-maps:field-metadata:workspace-id:data',
          value: { byId: {} },
        },
      ]);

      expect(storeMset).toHaveBeenCalledTimes(1);
      expect(storeMset).toHaveBeenCalledWith(
        [
          [prefixKey('flat-maps:field-metadata:workspace-id:hash'), 'hash-1'],
          [
            prefixKey('flat-maps:field-metadata:workspace-id:data'),
            { byId: {} },
          ],
        ],
        undefined,
      );
    });

    it('groups entries by ttl into one atomic store call per ttl', async () => {
      const { cache, storeMset } = createRedisCacheMock();
      const cacheStorageService = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineWorkspace,
      );

      await cacheStorageService.mset([
        { key: 'first', value: 1, ttl: 1000 },
        { key: 'second', value: 2 },
        { key: 'third', value: 3, ttl: 1000 },
      ]);

      expect(storeMset).toHaveBeenCalledTimes(2);
      expect(storeMset).toHaveBeenCalledWith(
        [
          [prefixKey('first'), 1],
          [prefixKey('third'), 3],
        ],
        1000,
      );
      expect(storeMset).toHaveBeenCalledWith(
        [[prefixKey('second'), 2]],
        undefined,
      );
    });

    it('does not call the store for empty entries', async () => {
      const { cache, storeMset } = createRedisCacheMock();
      const cacheStorageService = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineWorkspace,
      );

      await cacheStorageService.mset([]);

      expect(storeMset).not.toHaveBeenCalled();
    });

    it('falls back to sequential sets on non-redis stores', async () => {
      const cache = {
        store: { name: 'memory' },
        set: jest.fn().mockResolvedValue(undefined),
      } as unknown as Cache;
      const cacheStorageService = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineWorkspace,
      );

      await cacheStorageService.mset([
        { key: 'first', value: 1, ttl: 500 },
        { key: 'second', value: 2 },
      ]);

      expect(cache.set).toHaveBeenNthCalledWith(1, prefixKey('first'), 1, 500);
      expect(cache.set).toHaveBeenNthCalledWith(
        2,
        prefixKey('second'),
        2,
        undefined,
      );
    });
  });

  describe('compareAndMset', () => {
    const createRedisCacheMock = (evalResult: number) => {
      const evalMock = jest.fn().mockResolvedValue(evalResult);
      const cache = {
        store: { name: 'redis', client: { eval: evalMock } },
      } as unknown as Cache;

      return { cache, evalMock };
    };

    it('runs a single guarded script and serializes values like the redis store', async () => {
      const { cache, evalMock } = createRedisCacheMock(1);
      const cacheStorageService = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineWorkspace,
      );

      const written = await cacheStorageService.compareAndMset<unknown>({
        guardKey: 'entry:hash',
        expectedGuardValue: 'previous-hash',
        entries: [
          { key: 'entry:hash', value: 'next-hash' },
          { key: 'entry:data', value: { byId: {} } },
        ],
        ttl: 1000,
      });

      expect(written).toBe(true);
      expect(evalMock).toHaveBeenCalledTimes(1);
      expect(evalMock).toHaveBeenCalledWith(expect.any(String), {
        keys: [
          prefixKey('entry:hash'),
          prefixKey('entry:hash'),
          prefixKey('entry:data'),
        ],
        arguments: [
          '1',
          JSON.stringify('previous-hash'),
          '1000',
          JSON.stringify('next-hash'),
          JSON.stringify({ byId: {} }),
        ],
      });
    });

    it('requires the guard key to be absent when no expected value is given', async () => {
      const { cache, evalMock } = createRedisCacheMock(1);
      const cacheStorageService = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineWorkspace,
      );

      await cacheStorageService.compareAndMset<unknown>({
        guardKey: 'entry:hash',
        expectedGuardValue: undefined,
        entries: [{ key: 'entry:hash', value: 'next-hash' }],
        ttl: 1000,
      });

      expect(evalMock).toHaveBeenCalledWith(expect.any(String), {
        keys: [prefixKey('entry:hash'), prefixKey('entry:hash')],
        arguments: ['0', '', '1000', JSON.stringify('next-hash')],
      });
    });

    it('reports rejection when the script does not commit', async () => {
      const { cache } = createRedisCacheMock(0);
      const cacheStorageService = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineWorkspace,
      );

      const written = await cacheStorageService.compareAndMset<unknown>({
        guardKey: 'entry:hash',
        expectedGuardValue: 'previous-hash',
        entries: [{ key: 'entry:hash', value: 'next-hash' }],
        ttl: 1000,
      });

      expect(written).toBe(false);
    });

    it('falls back to check-then-write on non-redis stores', async () => {
      const cache = {
        store: { name: 'memory' },
        get: jest.fn().mockResolvedValue('previous-hash'),
        set: jest.fn().mockResolvedValue(undefined),
      } as unknown as Cache;
      const cacheStorageService = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineWorkspace,
      );

      const written = await cacheStorageService.compareAndMset<unknown>({
        guardKey: 'entry:hash',
        expectedGuardValue: 'previous-hash',
        entries: [
          { key: 'entry:hash', value: 'next-hash' },
          { key: 'entry:data', value: { byId: {} } },
        ],
        ttl: 1000,
      });

      expect(written).toBe(true);
      expect(cache.get).toHaveBeenCalledWith(prefixKey('entry:hash'));
      expect(cache.set).toHaveBeenNthCalledWith(
        1,
        prefixKey('entry:hash'),
        'next-hash',
        1000,
      );
      expect(cache.set).toHaveBeenNthCalledWith(
        2,
        prefixKey('entry:data'),
        { byId: {} },
        1000,
      );
    });

    it('rejects without writing on non-redis stores when the guard changed', async () => {
      const cache = {
        store: { name: 'memory' },
        get: jest.fn().mockResolvedValue('other-hash'),
        set: jest.fn(),
      } as unknown as Cache;
      const cacheStorageService = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineWorkspace,
      );

      const written = await cacheStorageService.compareAndMset<unknown>({
        guardKey: 'entry:hash',
        expectedGuardValue: 'previous-hash',
        entries: [{ key: 'entry:hash', value: 'next-hash' }],
        ttl: 1000,
      });

      expect(written).toBe(false);
      expect(cache.set).not.toHaveBeenCalled();
    });
  });
});
