import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CronTriggerDeduplicationService } from 'src/engine/core-modules/cron/services/cron-trigger-deduplication.service';

const CATCH_UP_WINDOW_MS = 5 * 60_000;
const LOCK_TTL_MS = 15 * 60_000;
const FIRE_TIMESTAMP = Date.parse('2026-09-23T04:30:00.000Z');

describe('CronTriggerDeduplicationService', () => {
  const acquireLock = jest.fn();
  const releaseLock = jest.fn();
  const service = new CronTriggerDeduplicationService({
    acquireLock,
    releaseLock,
  } as unknown as CacheStorageService);

  const acquire = (now: Date, pattern = '30 4 * * *') =>
    service.acquireDueUtcFireTime({
      keyPrefix: 'server-cron:registration-1:function-1',
      pattern,
      now,
      catchUpWindowMs: CATCH_UP_WINDOW_MS,
      lockTtlMs: LOCK_TTL_MS,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    acquireLock.mockResolvedValue(true);
  });

  describe('acquireDueUtcFireTime', () => {
    it('returns the UTC fire time and locks it', async () => {
      const fireTimestamp = await acquire(new Date('2026-09-23T04:30:20.000Z'));

      expect(fireTimestamp).toBe(FIRE_TIMESTAMP);
      expect(acquireLock).toHaveBeenCalledWith(
        `server-cron:registration-1:function-1:${FIRE_TIMESTAMP}`,
        LOCK_TTL_MS,
      );
    });

    it('evaluates the pattern in UTC whatever the process time zone', async () => {
      const originalTimeZone = process.env.TZ;

      process.env.TZ = 'America/New_York';

      try {
        const fireTimestamp = await acquire(
          new Date('2026-09-23T04:30:20.000Z'),
        );

        expect(fireTimestamp).toBe(FIRE_TIMESTAMP);
      } finally {
        process.env.TZ = originalTimeZone;
      }
    });

    it('catches up a tick that is late by less than the window', async () => {
      const fireTimestamp = await acquire(new Date('2026-09-23T04:34:00.000Z'));

      expect(fireTimestamp).toBe(FIRE_TIMESTAMP);
    });

    it('skips a tick that is late by more than the window', async () => {
      const fireTimestamp = await acquire(new Date('2026-09-23T04:36:00.000Z'));

      expect(fireTimestamp).toBeUndefined();
      expect(acquireLock).not.toHaveBeenCalled();
    });

    it('returns undefined when the fire time is already locked', async () => {
      acquireLock.mockResolvedValue(false);

      const fireTimestamp = await acquire(new Date('2026-09-23T04:30:20.000Z'));

      expect(fireTimestamp).toBeUndefined();
    });

    it('returns undefined for an invalid pattern', async () => {
      const fireTimestamp = await acquire(
        new Date('2026-09-23T04:30:20.000Z'),
        'not a cron',
      );

      expect(fireTimestamp).toBeUndefined();
      expect(acquireLock).not.toHaveBeenCalled();
    });
  });

  describe('releaseFireTime', () => {
    it('releases the lock of the fire time', async () => {
      await service.releaseFireTime({
        keyPrefix: 'server-cron:registration-1:function-1',
        fireTimestamp: FIRE_TIMESTAMP,
      });

      expect(releaseLock).toHaveBeenCalledWith(
        `server-cron:registration-1:function-1:${FIRE_TIMESTAMP}`,
      );
    });
  });
});
