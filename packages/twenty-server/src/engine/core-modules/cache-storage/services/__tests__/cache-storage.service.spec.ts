import { type Cache } from '@nestjs/cache-manager';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { PUBLISH_WORKSPACE_CACHE_SCRIPT } from 'src/engine/workspace-cache/constants/publish-workspace-cache-script.constant';

describe('CacheStorageService key prefix', () => {
  const key = 'flatObjectMetadataMaps:123:hash';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    {
      environment: 'production',
      prefix: undefined,
      expectedKey: 'engine:workspace:flatObjectMetadataMaps:123:hash',
    },
    {
      environment: 'production',
      prefix: '',
      expectedKey: 'engine:workspace:flatObjectMetadataMaps:123:hash',
    },
    {
      environment: 'production',
      prefix: '{twenty-cache}',
      expectedKey:
        '{twenty-cache}:engine:workspace:flatObjectMetadataMaps:123:hash',
    },
    {
      environment: 'test',
      prefix: '',
      expectedKey:
        'integration-tests:engine:workspace:flatObjectMetadataMaps:123:hash',
    },
    {
      environment: 'test',
      prefix: '{twenty-cache}',
      expectedKey:
        'integration-tests:{twenty-cache}:engine:workspace:flatObjectMetadataMaps:123:hash',
    },
  ])(
    'preserves the key contract for prefix "$prefix" in $environment',
    async ({ environment, prefix, expectedKey }) => {
      jest.replaceProperty(process, 'env', {
        ...process.env,
        NODE_ENV: environment,
      });

      const cache = {
        get: jest.fn().mockResolvedValue('existing-hash'),
        set: jest.fn(),
        del: jest.fn(),
      };
      const storage = new CacheStorageService(
        cache as unknown as Cache,
        CacheStorageNamespace.EngineWorkspace,
        prefix,
      );

      expect(await storage.get(key)).toBe('existing-hash');
      expect(cache.get).toHaveBeenCalledWith(expectedKey);

      await storage.set(key, 'new-hash', 60_000);
      expect(cache.set).toHaveBeenCalledWith(expectedKey, 'new-hash', 60_000);

      await storage.del(key);
      expect(cache.del).toHaveBeenCalledWith(expectedKey);
    },
  );

  describe.each([
    { prefix: '', expectedNamespace: 'engine:workspace' },
    {
      prefix: '{twenty-cache}',
      expectedNamespace: '{twenty-cache}:engine:workspace',
    },
  ])(
    'Redis operations with prefix "$prefix"',
    ({ prefix, expectedNamespace }) => {
      const keys = [key, 'flatObjectMetadataMaps:123:data'];
      const expectedKeys = keys.map(
        (cacheKey) => `${expectedNamespace}:${cacheKey}`,
      );
      const transaction = {
        set: jest.fn(),
        del: jest.fn(),
        exec: jest.fn(),
      };
      const client = {
        mGet: jest.fn().mockResolvedValue(['"hash"', '{"id":"123"}']),
        del: jest.fn(),
        multi: jest.fn().mockReturnValue(transaction),
        eval: jest.fn().mockResolvedValue([1]),
        scan: jest.fn().mockResolvedValue({ cursor: 0, keys: expectedKeys }),
      };
      const store = { name: 'redis', client, mset: jest.fn() };
      const storage = new CacheStorageService(
        { store } as unknown as Cache,
        CacheStorageNamespace.EngineWorkspace,
        prefix,
      );

      beforeEach(() => {
        jest.replaceProperty(process, 'env', {
          ...process.env,
          NODE_ENV: 'production',
        });
      });

      it('uses the same keys for bulk writes, reads, and deletion', async () => {
        await storage.mset(
          keys.map((cacheKey) => ({ key: cacheKey, value: 'hash' })),
        );
        expect(store.mset).toHaveBeenCalledWith(
          expectedKeys.map((cacheKey) => [cacheKey, 'hash']),
          undefined,
        );

        expect(await storage.mget(keys)).toEqual(['hash', { id: '123' }]);
        expect(client.mGet).toHaveBeenCalledWith(expectedKeys);

        await storage.mdel(keys);
        expect(client.del).toHaveBeenCalledWith(expectedKeys);
      });

      it('uses the same keys for publication and transactional invalidation', async () => {
        const args = ['60000', '', '"hash"', '{"id":"123"}'];

        expect(
          await storage.runScript({
            script: PUBLISH_WORKSPACE_CACHE_SCRIPT,
            keys,
            args,
          }),
        ).toEqual([1]);
        expect(client.eval).toHaveBeenCalledWith(
          PUBLISH_WORKSPACE_CACHE_SCRIPT.source,
          { keys: expectedKeys, arguments: args },
        );

        await storage.msetAndMdel({
          entries: [{ key: keys[0], value: 'invalidated', ttl: 60_000 }],
          keysToDelete: [keys[1]],
        });
        expect(transaction.set).toHaveBeenCalledWith(
          expectedKeys[0],
          '"invalidated"',
          { PX: 60_000 },
        );
        expect(transaction.del).toHaveBeenCalledWith([expectedKeys[1]]);
        expect(transaction.exec).toHaveBeenCalledTimes(1);
      });

      it('flushes only the configured namespace and pattern', async () => {
        await storage.flushByPattern('flatObjectMetadataMaps:*');

        expect(client.scan).toHaveBeenCalledWith(0, {
          MATCH: `${expectedNamespace}:flatObjectMetadataMaps:*`,
          COUNT: 100,
        });
        expect(client.del).toHaveBeenCalledWith(expectedKeys);
      });
    },
  );
});
