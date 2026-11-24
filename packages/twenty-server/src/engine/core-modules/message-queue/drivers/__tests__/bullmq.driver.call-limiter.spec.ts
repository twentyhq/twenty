import {
  buildLabels,
  createFairnessHarness,
  silenceDriverLogs,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const NOW_MS = Date.UTC(2026, 0, 1);
const HOUR_MS = 60 * 60 * 1_000;
const SCOPE = { workspaceId: 'A', applicationUniversalIdentifier: 'H' };
const GROUP_KEY = 'logicFunction:function-id:limiter:4:1000';
const LIMITER = { max: 4, durationMs: 1_000 };

const scheduledAtsOf = (result: { jobs: { scheduledAt: number }[] }) =>
  result.jobs.map(({ scheduledAt }) => scheduledAt - NOW_MS);

describe('BullMQDriver per-call limiter and scheduledAt', () => {
  beforeAll(silenceDriverLogs);

  beforeEach(() => {
    jest.useFakeTimers({
      now: NOW_MS,
      doNotFake: ['nextTick', 'setImmediate'],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('spaces the jobs of a call durationMs / max apart, starting now', async () => {
    const harness = await createFairnessHarness();
    const labels = buildLabels({ prefix: 'L', count: 4 });

    const result = await harness.enqueueBulk({
      labels,
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: LIMITER,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      undefined,
      250,
      500,
      750,
    ]);
    expect(scheduledAtsOf(result)).toEqual([0, 250, 500, 750]);
    expect(
      labels.map((label) => (harness.readScheduledAt({ label }) ?? 0) - NOW_MS),
    ).toEqual([0, 250, 500, 750]);
  });

  it('keeps the spacing across calls sharing the same limiter', async () => {
    const harness = await createFairnessHarness();

    await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'L', count: 2 }),
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: LIMITER,
    });

    const secondCall = await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'M', count: 2 }),
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: LIMITER,
    });

    expect(scheduledAtsOf(secondCall)).toEqual([500, 750]);
  });

  it('accepts reservations more than 7 days ahead', async () => {
    const harness = await createFairnessHarness();
    const labels = buildLabels({ prefix: 'L', count: 200 });

    const result = await harness.enqueueBulk({
      labels,
      ...SCOPE,
      groupKey: 'slow',
      limiter: { max: 1, durationMs: HOUR_MS },
    });

    expect(result.jobs).toHaveLength(200);
    expect(scheduledAtsOf(result)[199]).toBe(199 * HOUR_MS);
    expect(199 * HOUR_MS).toBeGreaterThan(7 * 24 * HOUR_MS);
  });

  it('replaces the queue group limiter instead of composing with it', async () => {
    const harness = await createFairnessHarness({
      groupLimiter: { max: 2, durationMs: 1_000 },
    });

    const result = await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'L', count: 3 }),
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: { max: 10, durationMs: 1_000 },
    });

    expect(scheduledAtsOf(result)).toEqual([0, 100, 200]);
  });

  it('reports the persisted schedule of a re-enqueued id without reserving another slot', async () => {
    const harness = await createFairnessHarness();
    const jobIds = ['job-1', 'job-2', 'job-3'];

    const firstCall = await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'L', count: 3 }),
      jobIds,
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: LIMITER,
    });

    const reEnqueue = await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'R', count: 3 }),
      jobIds,
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: LIMITER,
    });
    const nextJob = await harness.enqueueBulk({
      labels: ['N1'],
      jobIds: ['job-4'],
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: LIMITER,
    });

    expect(scheduledAtsOf(reEnqueue)).toEqual(scheduledAtsOf(firstCall));
    expect(harness.readScheduledAt({ label: 'R1' })).toBeUndefined();
    expect(scheduledAtsOf(nextJob)).toEqual([750]);
  });

  it('reports the persisted schedule of a job another producer added concurrently', async () => {
    const harness = await createFairnessHarness();

    harness.beforeNextAddBulk(async () => {
      await harness.storeJob({
        name: 'scenario-job',
        data: { label: 'C0' },
        options: {
          jobId: 'job-1',
          timestamp: NOW_MS,
          scheduledAt: NOW_MS + 42,
        },
      });
    });

    const result = await harness.enqueueBulk({
      labels: ['C1'],
      jobIds: ['job-1'],
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: LIMITER,
    });

    expect(scheduledAtsOf(result)).toEqual([42]);
  });

  it('schedules a delayed job at its insertion time plus the delay', async () => {
    const harness = await createFairnessHarness();

    const result = await harness.enqueueBulk({
      labels: ['D1'],
      ...SCOPE,
      delay: 5_000,
    });

    expect(scheduledAtsOf(result)).toEqual([5_000]);
  });

  it('schedules an immediate job at its insertion time', async () => {
    const harness = await createFairnessHarness();

    const result = await harness.enqueueBulk({ labels: ['I1'], ...SCOPE });

    expect(scheduledAtsOf(result)).toEqual([0]);
  });

  it('fails open to an immediate schedule when the pacer is unavailable', async () => {
    const harness = await createFairnessHarness();

    harness.breakRedis();

    const result = await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'L', count: 3 }),
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: LIMITER,
    });

    expect(scheduledAtsOf(result)).toEqual([0, 0, 0]);
    expect(
      harness.metricsService.incrementCounterForEvent.mock.calls.filter(
        ([{ key }]) => key === MetricsKeys.JobGroupRateLimitFallback,
      ),
    ).toHaveLength(1);
  });
});
