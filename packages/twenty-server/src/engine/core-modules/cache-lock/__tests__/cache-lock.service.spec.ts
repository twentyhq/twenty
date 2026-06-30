import { Test, type TestingModule } from '@nestjs/testing';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

describe('CacheLockService', () => {
  let service: CacheLockService;
  let cacheStorageService: jest.Mocked<CacheStorageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheLockService,
        {
          provide: CacheStorageNamespace.EngineLock,
          useValue: {
            acquireLock: jest.fn(),
            releaseLock: jest.fn(),
          },
        },
        {
          provide: CacheStorageService,
          useValue: {
            acquireLock: jest.fn(),
            releaseLock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CacheLockService>(CacheLockService);
    cacheStorageService = module.get(CacheStorageNamespace.EngineLock);
    jest.spyOn(service, 'delay').mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should acquire the lock and execute the function', async () => {
    cacheStorageService.acquireLock.mockResolvedValue(true);
    cacheStorageService.releaseLock.mockResolvedValue(undefined);

    const fn = jest.fn().mockResolvedValue('success');

    const ttl = 100;

    const result = await service.withLock(fn, 'key', {
      ttl,
    });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalled();
    expect(cacheStorageService.acquireLock).toHaveBeenCalledTimes(1);
    expect(cacheStorageService.acquireLock).toHaveBeenCalledWith('key', ttl);
    expect(cacheStorageService.releaseLock).toHaveBeenCalledTimes(1);
    expect(cacheStorageService.releaseLock).toHaveBeenCalledWith('key');
  });

  it('should throw an error if lock cannot be acquired after max retries', async () => {
    cacheStorageService.acquireLock.mockResolvedValue(false);

    const fn = jest.fn();
    const ms = 1;
    const maxRetries = 3;

    await expect(
      service.withLock(fn, 'key', { ms, maxRetries }),
    ).rejects.toThrow('Failed to acquire lock for key: key');

    expect(cacheStorageService.acquireLock).toHaveBeenCalledTimes(maxRetries);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should retry before acquiring the lock', async () => {
    const mockAcquireLock = cacheStorageService.acquireLock;

    mockAcquireLock
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const fn = jest.fn().mockResolvedValue('retried success');

    const result = await service.withLock(fn, 'key', {
      maxRetries: 5,
      ms: 1,
    });

    expect(result).toBe('retried success');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(mockAcquireLock).toHaveBeenCalledTimes(3);
    expect(cacheStorageService.releaseLock).toHaveBeenCalledWith('key');
  });

  it('should release the lock even if the function throws', async () => {
    cacheStorageService.acquireLock.mockResolvedValue(true);
    cacheStorageService.releaseLock.mockResolvedValue(undefined);

    const fn = jest.fn().mockRejectedValue(new Error('fail'));

    await expect(service.withLock(fn, 'key')).rejects.toThrow('fail');

    expect(fn).toHaveBeenCalled();
    expect(cacheStorageService.releaseLock).toHaveBeenCalledWith('key');
  });
});
