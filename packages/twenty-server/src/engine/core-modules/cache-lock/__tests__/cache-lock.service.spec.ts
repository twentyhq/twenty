import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CacheLockException } from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';

describe('CacheLockService', () => {
  const acquireLock = jest.fn();
  const releaseLock = jest.fn();

  const cacheStorageService = {
    acquireLock,
    releaseLock,
  };

  let service: CacheLockService;

  beforeEach(() => {
    jest.clearAllMocks();
    // oxlint-disable-next-line typescript/no-explicit-any
    service = new CacheLockService(cacheStorageService as any);
  });

  it('releases the lock using the token returned by acquireLock', async () => {
    acquireLock.mockResolvedValue('token-123');

    const result = await service.withLock(async () => 'result', 'my-key');

    expect(result).toBe('result');
    expect(releaseLock).toHaveBeenCalledWith('my-key', 'token-123');
  });

  it('releases the token-fenced lock even when fn throws', async () => {
    acquireLock.mockResolvedValue('token-123');

    await expect(
      service.withLock(async () => {
        throw new Error('boom');
      }, 'my-key'),
    ).rejects.toThrow('boom');

    expect(releaseLock).toHaveBeenCalledWith('my-key', 'token-123');
  });

  it('retries and throws without releasing when the lock cannot be acquired', async () => {
    jest.useRealTimers();
    acquireLock.mockResolvedValue(null);

    await expect(
      service.withLock(async () => 'result', 'my-key', {
        maxRetries: 2,
        ms: 0,
      }),
    ).rejects.toThrow(CacheLockException);

    expect(releaseLock).not.toHaveBeenCalled();
  });
});
