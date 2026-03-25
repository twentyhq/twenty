import { Test, type TestingModule } from '@nestjs/testing';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

describe('ThrottlerService', () => {
  let service: ThrottlerService;
  let cacheStorageService: jest.Mocked<CacheStorageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThrottlerService,
        {
          provide: CacheStorageNamespace.EngineWorkspace,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ThrottlerService>(ThrottlerService);
    cacheStorageService = module.get(CacheStorageNamespace.EngineWorkspace);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('tokenBucketThrottleOrThrow', () => {
    const key = 'test-throttle-key';
    const maxTokens = 100;
    const timeWindow = 1000; // 1 second

    it('should allow request when tokens are available (first request)', async () => {
      cacheStorageService.get.mockResolvedValue(null);

      await service.tokenBucketThrottleOrThrow(key, 10, maxTokens, timeWindow);

      expect(cacheStorageService.get).toHaveBeenCalledWith(key);
      expect(cacheStorageService.set).toHaveBeenCalledWith(
        key,
        {
          tokens: 90, // maxTokens - tokensToConsume
          lastRefillAt: expect.any(Number),
        },
        timeWindow * 2,
      );
    });

    it('should allow request when sufficient tokens are available', async () => {
      const now = Date.now();

      cacheStorageService.get.mockResolvedValue({
        tokens: 50,
        lastRefillAt: now - 100,
      });

      await service.tokenBucketThrottleOrThrow(key, 10, maxTokens, timeWindow);

      expect(cacheStorageService.get).toHaveBeenCalledWith(key);
      expect(cacheStorageService.set).toHaveBeenCalledWith(
        key,
        {
          tokens: expect.any(Number),
          lastRefillAt: expect.any(Number),
        },
        timeWindow * 2,
      );
    });

    it('should throw ThrottlerException when tokens are insufficient', async () => {
      const now = Date.now();

      cacheStorageService.get.mockResolvedValue({
        tokens: 5,
        lastRefillAt: now,
      });

      await expect(
        service.tokenBucketThrottleOrThrow(key, 10, maxTokens, timeWindow),
      ).rejects.toThrow(ThrottlerException);

      await expect(
        service.tokenBucketThrottleOrThrow(key, 10, maxTokens, timeWindow),
      ).rejects.toThrow('Limit reached');

      expect(cacheStorageService.set).not.toHaveBeenCalled();
    });

    it('should refill tokens over time', async () => {
      const now = Date.now();
      const refillRate = maxTokens / timeWindow; // 100 tokens per 1000ms = 0.1 tokens/ms
      const timePassed = 500; // 500ms
      const expectedRefill = Math.floor(timePassed * refillRate); // 50 tokens

      cacheStorageService.get.mockResolvedValue({
        tokens: 20,
        lastRefillAt: now - timePassed,
      });

      jest.spyOn(Date, 'now').mockReturnValue(now);

      await service.tokenBucketThrottleOrThrow(key, 10, maxTokens, timeWindow);

      expect(cacheStorageService.set).toHaveBeenCalledWith(
        key,
        {
          tokens: 20 + expectedRefill - 10, // 20 + 50 - 10 = 60
          lastRefillAt: now,
        },
        timeWindow * 2,
      );

      jest.restoreAllMocks();
    });

    it('should cap tokens at maxTokens', async () => {
      const now = Date.now();
      const timePassed = 5000; // Long time passed, would refill beyond max

      cacheStorageService.get.mockResolvedValue({
        tokens: 80,
        lastRefillAt: now - timePassed,
      });

      jest.spyOn(Date, 'now').mockReturnValue(now);

      await service.tokenBucketThrottleOrThrow(key, 10, maxTokens, timeWindow);

      // Available tokens should be capped at maxTokens (100)
      expect(cacheStorageService.set).toHaveBeenCalledWith(
        key,
        {
          tokens: 90, // maxTokens (100) - tokensToConsume (10)
          lastRefillAt: now,
        },
        timeWindow * 2,
      );

      jest.restoreAllMocks();
    });
  });
});
