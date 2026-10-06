import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

const TIME_WINDOW = 15 * 60 * 1000;

const buildThrottlerService = () => {
  const counters = new Map<string, number>();
  const cacheStorage = {
    incrBy: jest.fn(async (key: string, increment: number) => {
      const value = (counters.get(key) ?? 0) + increment;

      counters.set(key, value);

      return value;
    }),
    expire: jest.fn(async () => true),
  };

  return {
    throttlerService: new ThrottlerService(
      cacheStorage as unknown as CacheStorageService,
    ),
    cacheStorage,
    counters,
  };
};

describe('ThrottlerService', () => {
  describe('runWithFailureLimitOrThrow', () => {
    const limits = [{ key: 'sign-in:email', maxFailures: 2 }];
    const fail = () => Promise.reject(new Error('Wrong password'));

    it('should give the failure slot back when the attempt succeeds', async () => {
      const { throttlerService, counters } = buildThrottlerService();

      await expect(
        throttlerService.runWithFailureLimitOrThrow({
          limits,
          timeWindow: TIME_WINDOW,
          attempt: async () => 'ok',
        }),
      ).resolves.toBe('ok');

      expect(counters.get('sign-in:email')).toBe(0);
    });

    it('should refuse an attempt over the limit without running it', async () => {
      const { throttlerService } = buildThrottlerService();
      const attempt = jest.fn(fail);

      for (let index = 0; index < 2; index++) {
        await expect(
          throttlerService.runWithFailureLimitOrThrow({
            limits,
            timeWindow: TIME_WINDOW,
            attempt,
          }),
        ).rejects.toThrow('Wrong password');
      }

      await expect(
        throttlerService.runWithFailureLimitOrThrow({
          limits,
          timeWindow: TIME_WINDOW,
          attempt,
        }),
      ).rejects.toBeInstanceOf(ThrottlerException);

      expect(attempt).toHaveBeenCalledTimes(2);
    });

    it('should start the window on the first failure without extending it on later attempts', async () => {
      const { throttlerService, cacheStorage } = buildThrottlerService();

      for (let index = 0; index < 4; index++) {
        await throttlerService
          .runWithFailureLimitOrThrow({
            limits,
            timeWindow: TIME_WINDOW,
            attempt: fail,
          })
          .catch(() => undefined);
      }

      expect(cacheStorage.expire).toHaveBeenCalledTimes(1);
      expect(cacheStorage.expire).toHaveBeenCalledWith(
        'sign-in:email',
        TIME_WINDOW,
      );
    });
  });
});
