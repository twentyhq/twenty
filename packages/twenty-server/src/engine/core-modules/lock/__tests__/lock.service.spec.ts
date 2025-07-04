import { Test, TestingModule } from '@nestjs/testing';

import { LockService } from 'src/engine/core-modules/lock/lock.service';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

describe('LockService', () => {
  let service: LockService;
  let cacheStorageService: jest.Mocked<CacheStorageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockService,
        {
          provide: CacheStorageNamespace.EngineLock,
          useValue: {
            acquireLock: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: CacheStorageService,
          useValue: {
            acquireLock: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LockService>(LockService);
    cacheStorageService = module.get(CacheStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should acquire the lock and execute the function', async () => {
    cacheStorageService.acquireLock.mockResolvedValue(true);
    cacheStorageService.del.mockResolvedValue(undefined);

    const fn = jest.fn().mockResolvedValue('success');

    const ttl = 100;

    const result = await service.withLock(fn, 'key', {
      ttl,
    });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalled();
    expect(cacheStorageService.acquireLock).toHaveBeenCalledTimes(1);
    expect(cacheStorageService.acquireLock).toHaveBeenCalledWith(
      'workspaceId-recordId',
      ttl,
    );
    expect(cacheStorageService.del).toHaveBeenCalledTimes(1);
    expect(cacheStorageService.del).toHaveBeenCalledWith(
      'workspaceId-recordId',
    );
  });
});
