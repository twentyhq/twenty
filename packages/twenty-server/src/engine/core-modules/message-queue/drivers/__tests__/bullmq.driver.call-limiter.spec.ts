import {
  buildLabels,
  createFairnessHarness,
  silenceDriverLogs,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';
import { buildApplicationGroupKey } from 'src/engine/core-modules/message-queue/utils/build-application-group-key.util';
import { JOBS_PERSISTED_OPTIONS_SCRIPT } from 'src/engine/core-modules/message-queue/constants/jobs-persisted-options-script.constant';
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

  it('keeps the spacing when the producer clock moves away from the Redis clock', async () => {
    const harness = await createFairnessHarness();

    const firstCall = await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'L', count: 2 }),
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: LIMITER,
    });

    jest.setSystemTime(NOW_MS + 150);

    const secondCall = await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'M', count: 2 }),
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: LIMITER,
    });

    const [firstScheduledAt] = firstCall.jobs.map(
      ({ scheduledAt }) => scheduledAt,
    );

    expect(
      [...firstCall.jobs, ...secondCall.jobs].map(
        ({ scheduledAt }) => scheduledAt - firstScheduledAt,
      ),
    ).toEqual([0, 250, 500, 750]);
  });

  it('dates the first slot of an idle schedule on the Redis clock too', async () => {
    const harness = await createFairnessHarness();

    jest.setSystemTime(NOW_MS + 400);

    const result = await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'L', count: 2 }),
      ...SCOPE,
      groupKey: GROUP_KEY,
      limiter: LIMITER,
    });
    const [firstScheduledAt, secondScheduledAt] = result.jobs.map(
      ({ scheduledAt }) => scheduledAt,
    );

    expect(secondScheduledAt - firstScheduledAt).toBe(250);
    expect(harness.readDelay({ label: 'L1' })).toBeUndefined();
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

  it('reports the stored schedule of an id that is still waiting', async () => {
    const harness = await createFairnessHarness();
    const jobIds = ['job-1', 'job-2'];

    const firstCall = await harness.enqueueBulk({
      labels: ['W1', 'W2'],
      jobIds,
      ...SCOPE,
    });

    jest.setSystemTime(NOW_MS + 5_000);

    const reEnqueue = await harness.enqueueBulk({
      labels: ['R1', 'R2'],
      jobIds,
      ...SCOPE,
    });

    expect(scheduledAtsOf(firstCall)).toEqual([0, 0]);
    expect(reEnqueue.jobs.map(({ jobId }) => jobId)).toEqual(jobIds);
    expect(scheduledAtsOf(reEnqueue)).toEqual([0, 0]);
  });

  it('fails instead of reporting a new date when the schedule of an existing id cannot be read', async () => {
    const harness = await createFairnessHarness();

    await harness.enqueueBulk({ labels: ['W1'], jobIds: ['job-1'], ...SCOPE });
    harness.failScript({ script: JOBS_PERSISTED_OPTIONS_SCRIPT });

    await expect(
      harness.enqueueBulk({
        labels: ['R1'],
        jobIds: ['job-1'],
        ...SCOPE,
        delay: 5_000,
      }),
    ).rejects.toThrow('Redis read failed');
  });

  it('fails instead of reporting a new date when another producer added the id and its schedule cannot be read', async () => {
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
    harness.failScript({ script: JOBS_PERSISTED_OPTIONS_SCRIPT });

    await expect(
      harness.enqueueBulk({
        labels: ['C1'],
        jobIds: ['job-1'],
        ...SCOPE,
        delay: 5_000,
      }),
    ).rejects.toThrow('Redis read failed');
  });

  it('reports the computed date of server-generated ids when their schedule cannot be read back', async () => {
    const harness = await createFairnessHarness();

    harness.failScript({ script: JOBS_PERSISTED_OPTIONS_SCRIPT });

    const result = await harness.enqueueBulk({
      labels: ['G1'],
      jobIds: ['generated-job-1'],
      isJobIdGenerated: true,
      ...SCOPE,
      delay: 5_000,
    });

    expect(scheduledAtsOf(result)).toEqual([5_000]);
  });

  it('does not charge fair tickets for an id that is still queued', async () => {
    const harness = await createFairnessHarness();
    const applicationGroupKey = buildApplicationGroupKey(
      SCOPE.applicationUniversalIdentifier,
    );

    await harness.enqueueBulk({ labels: ['W1'], jobIds: ['job-1'], ...SCOPE });

    const clockAfterFirstEnqueue = await harness.readClock({
      groupKey: applicationGroupKey,
    });

    for (const label of buildLabels({ prefix: 'R', count: 10 })) {
      await harness.enqueueBulk({
        labels: [label],
        jobIds: ['job-1'],
        ...SCOPE,
      });
    }

    expect(await harness.readClock({ groupKey: applicationGroupKey })).toBe(
      clockAfterFirstEnqueue,
    );
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
