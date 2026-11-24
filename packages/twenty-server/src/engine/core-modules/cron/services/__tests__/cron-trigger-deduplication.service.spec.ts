import { CronTriggerDeduplicationService } from 'src/engine/core-modules/cron/services/cron-trigger-deduplication.service';
import { computeCronTriggerSpreadOffsetMs } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/compute-cron-trigger-spread-offset-ms.util';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const START_MS = Date.UTC(2026, 0, 1);

const buildService = () => {
  const acquiredKeys = new Set<string>();

  return new CronTriggerDeduplicationService({
    acquireLock: async ({ key }: { key: string }) => {
      if (acquiredKeys.has(key)) {
        return null;
      }

      acquiredKeys.add(key);

      return 'owner-token';
    },
  } as never);
};

// Ticks a few seconds late, like the root cron, and returns the dispatch times
const runTicks = async ({
  pattern,
  offsetMs,
  durationMs,
}: {
  pattern: string;
  offsetMs: number;
  durationMs: number;
}) => {
  const service = buildService();
  const dispatchTimes: number[] = [];

  for (
    let tickMs = START_MS;
    tickMs < START_MS + durationMs;
    tickMs += MINUTE_MS
  ) {
    const now = tickMs + 3_000;

    if (
      await service.shouldDispatch('key', pattern, new Date(now - offsetMs))
    ) {
      dispatchTimes.push(tickMs);
    }
  }

  return dispatchTimes;
};

describe('CronTriggerDeduplicationService with a spread offset', () => {
  it('keeps the historical schedule without an offset', async () => {
    const dispatchTimes = await runTicks({
      pattern: '0 * * * *',
      offsetMs: 0,
      durationMs: 3 * HOUR_MS,
    });

    expect(dispatchTimes).toEqual([
      START_MS,
      START_MS + HOUR_MS,
      START_MS + 2 * HOUR_MS,
    ]);
  });

  it('shifts the phase of an hourly cron by the offset', async () => {
    const dispatchTimes = await runTicks({
      pattern: '0 * * * *',
      offsetMs: 37 * MINUTE_MS,
      durationMs: 3 * HOUR_MS,
    });

    expect(dispatchTimes).toEqual([
      START_MS + 37 * MINUTE_MS,
      START_MS + HOUR_MS + 37 * MINUTE_MS,
      START_MS + 2 * HOUR_MS + 37 * MINUTE_MS,
    ]);
  });

  it('keeps an hourly cron hourly with a 24 hour spread', async () => {
    for (const workspaceId of ['workspace-1', 'workspace-2', 'workspace-3']) {
      const offsetMs = computeCronTriggerSpreadOffsetMs({
        workspaceId,
        logicFunctionUniversalIdentifier:
          'b6f9a5b4-1d4e-4a4b-9c55-6c1f0b2a7e11',
        spreadMs: 24 * HOUR_MS,
      });
      const dispatchTimes = await runTicks({
        pattern: '0 * * * *',
        offsetMs,
        durationMs: 24 * HOUR_MS,
      });

      expect(dispatchTimes).toHaveLength(24);
      dispatchTimes.slice(1).forEach((dispatchTime, index) => {
        expect(dispatchTime - dispatchTimes[index]).toBe(HOUR_MS);
      });
    }
  });

  it('keeps an every-minute cron running every minute', async () => {
    const dispatchTimes = await runTicks({
      pattern: '* * * * *',
      offsetMs: 7 * MINUTE_MS,
      durationMs: HOUR_MS,
    });

    expect(dispatchTimes).toHaveLength(60);
  });
});
