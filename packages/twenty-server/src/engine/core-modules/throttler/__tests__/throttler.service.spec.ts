import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { TOKEN_BUCKET_THROTTLE_SCRIPT } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-script.constant';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

describe('ThrottlerService', () => {
  let throttlerService: ThrottlerService;
  let mockCacheStorage: jest.Mocked<Partial<CacheStorageService>>;

  beforeEach(() => {
    mockCacheStorage = {
      runScript: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    };
    throttlerService = new ThrottlerService(
      mockCacheStorage as CacheStorageService,
    );
  });

  describe('tokenBucketThrottleOrThrow', () => {
    it('should consume tokens atomically via runScript when available', async () => {
      mockCacheStorage.runScript.mockResolvedValue(4);

      const remaining = await throttlerService.tokenBucketThrottleOrThrow(
        'test-key',
        1,
        5,
        60_000,
      );

      expect(remaining).toBe(4);
      expect(mockCacheStorage.runScript).toHaveBeenCalledWith(
        expect.objectContaining({
          script: TOKEN_BUCKET_THROTTLE_SCRIPT,
          keys: ['test-key'],
        }),
      );
    });

    it('should throw ThrottlerException when script returns -1', async () => {
      mockCacheStorage.runScript.mockResolvedValue(-1);

      await expect(
        throttlerService.tokenBucketThrottleOrThrow('test-key', 1, 5, 60_000),
      ).rejects.toThrow(
        new ThrottlerException(
          'Limit reached (5 tokens per 60000 ms)',
          ThrottlerExceptionCode.LIMIT_REACHED,
        ),
      );
    });

    it('should fall back to in-memory evaluation if runScript fails', async () => {
      mockCacheStorage.runScript.mockRejectedValue(
        new Error('Redis not configured'),
      );
      mockCacheStorage.get.mockResolvedValue({
        tokens: 3,
        lastRefillAt: Date.now(),
      });
      mockCacheStorage.set.mockResolvedValue(undefined);

      const remaining = await throttlerService.tokenBucketThrottleOrThrow(
        'test-key',
        1,
        5,
        60_000,
      );

      expect(remaining).toBe(2);
      expect(mockCacheStorage.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('consumeTokens', () => {
    it('should consume tokens without throwing when limit is reached', async () => {
      mockCacheStorage.runScript.mockResolvedValue(-1);

      await expect(
        throttlerService.consumeTokens('test-key', 1, 5, 60_000),
      ).resolves.toBeUndefined();
    });
  });

  describe('getAvailableTokensCount', () => {
    it('should refill tokens up to maxTokens based on elapsed time', async () => {
      const now = Date.now();
      const oneMinuteAgo = now - 60_000;
      mockCacheStorage.get.mockResolvedValue({
        tokens: 0,
        lastRefillAt: oneMinuteAgo,
      });

      const count = await throttlerService.getAvailableTokensCount(
        'test-key',
        10,
        60_000,
        now,
      );

      expect(count).toBe(10);
    });
  });
});
