import {
  buildLabels,
  createFairnessHarness,
  silenceDriverLogs,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';
import { URGENT_FAIR_PRIORITY } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { buildQueueJobLimiter } from 'src/engine/core-modules/message-queue/utils/build-queue-job-limiter.util';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const LIMITER = { key: 'workflow:W1', max: 2, durationMs: 1_000 };

describe('BullMQDriver limiter', () => {
  beforeAll(silenceDriverLogs);

  afterEach(() => {
    jest.useRealTimers();
  });

  it('runs the first job immediately and delays the next ones by the interval', async () => {
    const harness = await createFairnessHarness({
      isGroupLimiterEnabled: true,
    });
    const labels = buildLabels({ prefix: 'H', count: 4 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      limiter: LIMITER,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      undefined,
      500,
      1_000,
      1_500,
    ]);
    expect(
      harness.metricsService.incrementCounterForEvent.mock.calls.filter(
        ([{ key }]) => key === MetricsKeys.JobGroupRatePaced,
      ),
    ).toHaveLength(1);
    expect(await harness.processAll()).toEqual(['H1']);

    harness.advanceTime({ milliseconds: 500 });

    expect(await harness.processAll()).toEqual(['H2']);

    harness.advanceTime({ milliseconds: 1_000 });

    expect(await harness.processAll()).toEqual(['H3', 'H4']);
  });

  it('paces jobs enqueued one by one like a batch', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });

    const harness = await createFairnessHarness({
      isGroupLimiterEnabled: true,
    });
    const labels = buildLabels({ prefix: 'H', count: 3 });

    await harness.enqueueMany({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      limiter: LIMITER,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      undefined,
      500,
      1_000,
    ]);
  });

  it('gives each workspace and each application its own slots for the same key', async () => {
    const harness = await createFairnessHarness({
      isGroupLimiterEnabled: true,
    });
    const scopes = [
      { prefix: 'A', workspaceId: 'A', applicationUniversalIdentifier: 'H' },
      { prefix: 'B', workspaceId: 'B', applicationUniversalIdentifier: 'H' },
      { prefix: 'Q', workspaceId: 'A', applicationUniversalIdentifier: 'Q' },
    ];

    for (const {
      prefix,
      workspaceId,
      applicationUniversalIdentifier,
    } of scopes) {
      await harness.enqueueBulk({
        labels: buildLabels({ prefix, count: 2 }),
        workspaceId,
        applicationUniversalIdentifier,
        limiter: LIMITER,
      });
    }

    expect(
      ['A1', 'A2', 'B1', 'B2', 'Q1', 'Q2'].map((label) =>
        harness.readDelay({ label }),
      ),
    ).toEqual([undefined, 500, undefined, 500, undefined, 500]);
  });

  it('starts pacing at the caller delay', async () => {
    const harness = await createFairnessHarness({
      isGroupLimiterEnabled: true,
    });
    const labels = buildLabels({ prefix: 'H', count: 4 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      limiter: LIMITER,
      delay: 700,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      700, 1_200, 1_700, 2_200,
    ]);
  });

  it('does not hold new jobs behind a delayed job of the same key', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });

    const harness = await createFairnessHarness({
      isGroupLimiterEnabled: true,
    });
    const scope = { workspaceId: 'A', applicationUniversalIdentifier: 'H' };

    await harness.enqueue({
      label: 'R1',
      delay: 15_000,
      limiter: LIMITER,
      ...scope,
    });
    await harness.enqueue({ label: 'N1', limiter: LIMITER, ...scope });

    expect(harness.readDelay({ label: 'R1' })).toBe(15_000);
    expect(harness.readDelay({ label: 'N1' })).toBe(500);
  });

  it('does not delay jobs without a limiter', async () => {
    const harness = await createFairnessHarness({
      isGroupLimiterEnabled: true,
    });
    const labels = buildLabels({ prefix: 'H', count: 3 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      limiter: buildQueueJobLimiter({ key: LIMITER.key, limiter: null }),
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
    expect(await harness.processAll()).toEqual(labels);
  });

  it('does not reserve a slot again for a job id that is already queued', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });

    const harness = await createFairnessHarness({
      isGroupLimiterEnabled: true,
    });
    const jobIds = ['job-1', 'job-2', 'job-3'];

    await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'H', count: 3 }),
      jobIds,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      limiter: LIMITER,
    });
    await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'R', count: 3 }),
      jobIds,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      limiter: LIMITER,
    });
    await harness.enqueueBulk({
      labels: ['F1'],
      jobIds: ['job-4'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      limiter: LIMITER,
    });

    expect(harness.readDelay({ label: 'H3' })).toBe(1_000);
    expect(harness.readDelay({ label: 'F1' })).toBe(1_500);
  });

  it('only dedupes paced jobs against the delayed set', async () => {
    const harness = await createFairnessHarness({
      isGroupLimiterEnabled: true,
    });
    const scope = { workspaceId: 'A', applicationUniversalIdentifier: 'H' };

    await harness.enqueue({ label: 'D1', id: 'job', delay: 5_000, ...scope });
    await harness.enqueue({ label: 'D2', id: 'job', delay: 5_000, ...scope });
    await harness.enqueue({
      label: 'P1',
      id: 'job',
      delay: 5_000,
      limiter: LIMITER,
      ...scope,
    });

    expect(harness.readDelay({ label: 'D2' })).toBe(5_000);
    expect(harness.readDelay({ label: 'P1' })).toBeUndefined();
  });

  it('never paces the urgent lane', async () => {
    const harness = await createFairnessHarness({
      isGroupLimiterEnabled: true,
    });

    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'U', count: 4 }),
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      priority: URGENT_FAIR_PRIORITY,
      limiter: LIMITER,
    });

    expect(await harness.processAll()).toEqual(['U1', 'U2', 'U3', 'U4']);
  });

  it('does not pace when IS_WORKER_GROUP_LIMITER_ENABLED is off', async () => {
    const harness = await createFairnessHarness();
    const labels = buildLabels({ prefix: 'H', count: 4 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      limiter: LIMITER,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(await harness.processAll()).toEqual(['H1', 'H2', 'H3', 'H4']);
  });
});
