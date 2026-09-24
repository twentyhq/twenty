import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';

describe('CacheLockService', () => {
  let cacheLockService: CacheLockService;
  let mockCacheStorageService: jest.Mocked<Partial<CacheStorageService>>;

  beforeEach(() => {
    mockCacheStorageService = {
      acquireLock: jest.fn(),
      releaseLock: jest.fn(),
    };
    cacheLockService = new CacheLockService(
      mockCacheStorageService as CacheStorageService,
    );
    jest.spyOn(cacheLockService, 'delay').mockResolvedValue(undefined as never);
  });

  it('should acquire lock with a unique ownerToken and release with same ownerToken on success', async () => {
    mockCacheStorageService.acquireLock.mockResolvedValue(true);
    mockCacheStorageService.releaseLock.mockResolvedValue(true);

    const fn = jest.fn().mockResolvedValue('success-result');
    const result = await cacheLockService.withLock(fn, 'test-key', {
      ttl: 3000,
    });

    expect(result).toBe('success-result');
    expect(fn).toHaveBeenCalledTimes(1);

    expect(mockCacheStorageService.acquireLock).toHaveBeenCalledTimes(1);
    const [acquireKey, acquireTtl, acquireToken] =
      mockCacheStorageService.acquireLock.mock.calls[0];

    expect(acquireKey).toBe('test-key');
    expect(acquireTtl).toBe(3000);
    expect(typeof acquireToken).toBe('string');
    expect(acquireToken.length).toBeGreaterThan(10);

    expect(mockCacheStorageService.releaseLock).toHaveBeenCalledTimes(1);
    expect(mockCacheStorageService.releaseLock).toHaveBeenCalledWith(
      'test-key',
      acquireToken,
    );
  });

  it('should release lock with ownerToken even when fn throws', async () => {
    mockCacheStorageService.acquireLock.mockResolvedValue(true);
    mockCacheStorageService.releaseLock.mockResolvedValue(true);

    const error = new Error('computation failure');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(cacheLockService.withLock(fn, 'test-key')).rejects.toThrow(
      'computation failure',
    );

    expect(mockCacheStorageService.releaseLock).toHaveBeenCalledTimes(1);
    const [_, releaseToken] = mockCacheStorageService.releaseLock.mock.calls[0];
    const [__, ___, acquireToken] =
      mockCacheStorageService.acquireLock.mock.calls[0];

    expect(releaseToken).toBe(acquireToken);
  });

  it('should retry acquisition up to maxRetries if not acquired immediately', async () => {
    mockCacheStorageService.acquireLock
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    mockCacheStorageService.releaseLock.mockResolvedValue(true);

    const fn = jest.fn().mockResolvedValue('ok');
    const result = await cacheLockService.withLock(fn, 'retry-key', {
      maxRetries: 5,
    });

    expect(result).toBe('ok');
    expect(mockCacheStorageService.acquireLock).toHaveBeenCalledTimes(3);
    expect(cacheLockService.delay).toHaveBeenCalledTimes(2);
  });

  it('should throw CacheLockException if lock cannot be acquired after maxRetries', async () => {
    mockCacheStorageService.acquireLock.mockResolvedValue(false);

    const fn = jest.fn();

    await expect(
      cacheLockService.withLock(fn, 'busy-key', { maxRetries: 3 }),
    ).rejects.toThrow(
      new CacheLockException(
        'Failed to acquire lock for key: busy-key',
        CacheLockExceptionCode.LOCK_ACQUISITION_TIMEOUT,
      ),
    );

    expect(fn).not.toHaveBeenCalled();
    expect(mockCacheStorageService.releaseLock).not.toHaveBeenCalled();
  });
});
