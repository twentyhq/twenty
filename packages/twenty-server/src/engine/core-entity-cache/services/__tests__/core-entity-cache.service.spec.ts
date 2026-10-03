import { type DiscoveryService, Reflector } from '@nestjs/core';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type FlatUser } from 'src/engine/core-modules/user/types/flat-user.type';

@CoreEntityCache('user')
class UserTestProvider extends CoreEntityCacheProvider<FlatUser> {
  async computeForCache(): Promise<FlatUser | null> {
    return { id: USER_ID } as FlatUser;
  }
}

const USER_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

describe('CoreEntityCacheService', () => {
  let cacheStorage: jest.Mocked<
    Pick<CacheStorageService, 'mget' | 'mset' | 'mdel' | 'del'>
  >;
  let service: CoreEntityCacheService;

  beforeEach(async () => {
    cacheStorage = {
      mget: jest.fn(async (keys: string[]) => keys.map(() => undefined)),
      mset: jest.fn(),
      mdel: jest.fn(),
      del: jest.fn(),
    } as unknown as typeof cacheStorage;

    const discoveryService = {
      getProviders: () => [{ instance: new UserTestProvider() }],
    } as unknown as DiscoveryService;

    service = new CoreEntityCacheService(
      cacheStorage as unknown as CacheStorageService,
      discoveryService,
      new Reflector(),
    );

    await service.onModuleInit();
  });

  describe('redis keys', () => {
    it('writes the hash and data keys of an entity under one hash tag', async () => {
      await service.invalidateAndRecompute('user', USER_ID);

      const writtenKeys = cacheStorage.mset.mock.calls.flatMap(([entries]) =>
        entries.map(({ key }) => key),
      );

      expect(writtenKeys.sort()).toEqual(
        [`user:{${USER_ID}}:data`, `user:{${USER_ID}}:hash`].sort(),
      );
    });

    it('deletes tagged keys in one batch and untagged legacy keys one by one on invalidate', async () => {
      await service.invalidate('user', USER_ID);

      expect(cacheStorage.mdel).toHaveBeenCalledWith([
        `user:{${USER_ID}}:data`,
        `user:{${USER_ID}}:hash`,
      ]);
      expect(cacheStorage.del.mock.calls.map(([key]) => key).sort()).toEqual(
        [`user:${USER_ID}:data`, `user:${USER_ID}:hash`].sort(),
      );
    });
  });
});
