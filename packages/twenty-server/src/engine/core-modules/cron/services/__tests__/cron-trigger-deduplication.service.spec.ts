import { CronTriggerDeduplicationService } from 'src/engine/core-modules/cron/services/cron-trigger-deduplication.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';

describe('CronTriggerDeduplicationService', () => {
  const heldLockKeys = new Set<string>();
  const acquireLock = jest.fn(async ({ key }: { key: string }) => {
    if (heldLockKeys.has(key)) {
      return null;
    }

    heldLockKeys.add(key);

    return 'lock-owner-token';
  });
  const service = new CronTriggerDeduplicationService({
    acquireLock,
  } as unknown as CacheStorageService);

  beforeEach(() => {
    heldLockKeys.clear();
    acquireLock.mockClear();
  });

  it('dispatches a trigger due within the current minute once across workers', async () => {
    const now = new Date('2026-04-03T09:30:20.000Z');

    const dispatches = await Promise.all([
      service.shouldDispatch(
        'workflow-cron:workspace:workflow',
        '30 9 */2 * *',
        now,
      ),
      service.shouldDispatch(
        'workflow-cron:workspace:workflow',
        '30 9 */2 * *',
        now,
      ),
    ]);

    expect(dispatches.filter(Boolean)).toHaveLength(1);
    expect(acquireLock).toHaveBeenCalledWith({
      key: `workflow-cron:workspace:workflow:${new Date('2026-04-03T09:30:00.000Z').getTime()}`,
      ttl: 120_000,
    });
  });

  it('keeps triggers of different owners apart on the same tick', async () => {
    const now = new Date('2026-04-02T09:30:20.000Z');

    expect(
      await service.shouldDispatch(
        'agent-cron:workspace:agent:trigger',
        '* * * * *',
        now,
      ),
    ).toBe(true);
    expect(
      await service.shouldDispatch(
        'workflow-cron:workspace:workflow',
        '* * * * *',
        now,
      ),
    ).toBe(true);
  });

  it('does not catch up on a tick that passed more than a minute ago', async () => {
    expect(
      await service.shouldDispatch(
        'workflow-cron:workspace:workflow',
        '30 9 * * *',
        new Date('2026-04-02T09:31:00.000Z'),
      ),
    ).toBe(false);
    expect(acquireLock).not.toHaveBeenCalled();
  });

  it('skips a pattern the parser rejects', async () => {
    expect(
      await service.shouldDispatch(
        'workflow-cron:workspace:workflow',
        'every monday',
        new Date('2026-04-02T09:30:20.000Z'),
      ),
    ).toBe(false);
    expect(acquireLock).not.toHaveBeenCalled();
  });
});
