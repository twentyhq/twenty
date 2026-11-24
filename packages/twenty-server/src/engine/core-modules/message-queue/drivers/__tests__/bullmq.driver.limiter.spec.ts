import {
  buildLabels,
  createFairnessHarness,
  silenceDriverLogs,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';
import { URGENT_FAIR_PRIORITY } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const GROUP_KEY = 'workflow';
const GROUP_LIMITER = { max: 2, durationMs: 1_000 };

describe('BullMQDriver limiter', () => {
  beforeAll(silenceDriverLogs);

  afterEach(() => {
    jest.useRealTimers();
  });

  it('runs the first job immediately and delays the next ones by the interval', async () => {
    const harness = await createFairnessHarness({
      groupLimiter: GROUP_LIMITER,
    });
    const labels = buildLabels({ prefix: 'H', count: 4 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      groupKey: GROUP_KEY,
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
      groupLimiter: GROUP_LIMITER,
    });
    const labels = buildLabels({ prefix: 'H', count: 3 });

    await harness.enqueueMany({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      groupKey: GROUP_KEY,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      undefined,
      500,
      1_000,
    ]);
  });

  it('gives each workspace its own slots and shares them between its applications', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });

    const harness = await createFairnessHarness({
      groupLimiter: GROUP_LIMITER,
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
        groupKey: GROUP_KEY,
      });
    }

    expect(
      ['A1', 'A2', 'B1', 'B2', 'Q1', 'Q2'].map((label) =>
        harness.readDelay({ label }),
      ),
    ).toEqual([undefined, 500, undefined, 500, 1_000, 1_500]);
  });

  it('gives each group of a workspace its own slots', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });

    const harness = await createFairnessHarness({
      groupLimiter: GROUP_LIMITER,
    });

    for (const [prefix, groupKey] of [
      ['H', GROUP_KEY],
      ['I', 'imports'],
    ]) {
      await harness.enqueueBulk({
        labels: buildLabels({ prefix, count: 2 }),
        workspaceId: 'A',
        groupKey,
      });
    }

    expect(
      ['H1', 'H2', 'I1', 'I2'].map((label) => harness.readDelay({ label })),
    ).toEqual([undefined, 500, undefined, 500]);
  });

  it('continues the slots a previous producer reserved for the group', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });

    const harness = await createFairnessHarness({
      groupLimiter: GROUP_LIMITER,
    });

    await harness.reserveLimiterSlot({
      slotKey: 'A:jobGroup:workflow',
      delayMs: 2_000,
    });
    await harness.enqueueBulk({
      labels: ['N1', 'N2'],
      workspaceId: 'A',
      groupKey: GROUP_KEY,
    });

    expect(harness.readDelay({ label: 'N1' })).toBe(2_000);
    expect(harness.readDelay({ label: 'N2' })).toBe(2_500);
  });

  it('does not delay the jobs of a queue without a group limiter', async () => {
    const harness = await createFairnessHarness();
    const labels = buildLabels({ prefix: 'H', count: 3 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      groupKey: GROUP_KEY,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('starts pacing at the caller delay', async () => {
    const harness = await createFairnessHarness({
      groupLimiter: GROUP_LIMITER,
    });
    const labels = buildLabels({ prefix: 'H', count: 4 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      groupKey: GROUP_KEY,
      delay: 700,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      700, 1_200, 1_700, 2_200,
    ]);
  });

  it('does not hold new jobs behind a delayed job of the same key', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });

    const harness = await createFairnessHarness({
      groupLimiter: GROUP_LIMITER,
    });
    const scope = { workspaceId: 'A', applicationUniversalIdentifier: 'H' };

    await harness.enqueue({
      label: 'R1',
      delay: 15_000,
      groupKey: GROUP_KEY,
      ...scope,
    });
    await harness.enqueue({ label: 'N1', groupKey: GROUP_KEY, ...scope });

    expect(harness.readDelay({ label: 'R1' })).toBe(15_000);
    expect(harness.readDelay({ label: 'N1' })).toBe(500);
  });

  it('does not delay jobs without a group', async () => {
    const harness = await createFairnessHarness({
      groupLimiter: GROUP_LIMITER,
    });
    const labels = buildLabels({ prefix: 'H', count: 3 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
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
      groupLimiter: GROUP_LIMITER,
    });
    const jobIds = ['job-1', 'job-2', 'job-3'];

    await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'H', count: 3 }),
      jobIds,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      groupKey: GROUP_KEY,
    });
    await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'R', count: 3 }),
      jobIds,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      groupKey: GROUP_KEY,
    });
    await harness.enqueueBulk({
      labels: ['F1'],
      jobIds: ['job-4'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      groupKey: GROUP_KEY,
    });

    expect(harness.readDelay({ label: 'H3' })).toBe(1_000);
    expect(harness.readDelay({ label: 'F1' })).toBe(1_500);
  });

  it('only dedupes paced jobs against the delayed set', async () => {
    const harness = await createFairnessHarness({
      groupLimiter: GROUP_LIMITER,
    });
    const scope = { workspaceId: 'A', applicationUniversalIdentifier: 'H' };

    await harness.enqueue({ label: 'D1', id: 'job', delay: 5_000, ...scope });
    await harness.enqueue({ label: 'D2', id: 'job', delay: 5_000, ...scope });
    await harness.enqueue({
      label: 'P1',
      id: 'job',
      delay: 5_000,
      groupKey: GROUP_KEY,
      ...scope,
    });

    expect(harness.readDelay({ label: 'D2' })).toBe(5_000);
    expect(harness.readDelay({ label: 'P1' })).toBeUndefined();
  });

  it('never paces the urgent lane', async () => {
    const harness = await createFairnessHarness({
      groupLimiter: GROUP_LIMITER,
    });

    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'U', count: 4 }),
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      priority: URGENT_FAIR_PRIORITY,
      groupKey: GROUP_KEY,
    });

    expect(await harness.processAll()).toEqual(['U1', 'U2', 'U3', 'U4']);
  });
});
