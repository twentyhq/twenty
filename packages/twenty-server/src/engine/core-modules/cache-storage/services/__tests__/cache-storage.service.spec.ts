import { type Cache } from '@nestjs/cache-manager';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

describe('CacheStorageService locking', () => {
  const set = jest.fn();
  const del = jest.fn();
  const evalMock = jest.fn();

  const cache = {
    store: {
      name: 'redis',
      client: {
        set,
        eval: evalMock,
      },
    },
    del,
  } as unknown as Cache;

  let service: CacheStorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CacheStorageService(cache, CacheStorageNamespace.EngineLock);
  });

  describe('acquireLock', () => {
    it('stores a random token as the lock value and returns it', async () => {
      set.mockResolvedValue('OK');

      const token = await service.acquireLock('my-lock', 1000);

      expect(token).toEqual(expect.any(String));
      expect(set).toHaveBeenCalledWith(
        expect.stringContaining('my-lock'),
        token,
        { NX: true, PX: 1000 },
      );
    });

    it('returns a different token on each successful acquisition', async () => {
      set.mockResolvedValue('OK');

      const tokenA = await service.acquireLock('lock-a', 1000);
      const tokenB = await service.acquireLock('lock-b', 1000);

      expect(tokenA).not.toBe(tokenB);
    });

    it('returns null when the key is already locked', async () => {
      set.mockResolvedValue(null);

      const token = await service.acquireLock('my-lock', 1000);

      expect(token).toBeNull();
    });
  });

  describe('releaseLock', () => {
    it('runs a compare-and-delete script when a token is provided', async () => {
      await service.releaseLock('my-lock', 'token-1');

      expect(evalMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          keys: [expect.stringContaining('my-lock')],
          arguments: ['token-1'],
        }),
      );
      expect(del).not.toHaveBeenCalled();
    });

    it('falls back to an unconditional delete when no token is provided', async () => {
      await service.releaseLock('my-lock');

      expect(del).toHaveBeenCalledWith(expect.stringContaining('my-lock'));
      expect(evalMock).not.toHaveBeenCalled();
    });
  });
});
