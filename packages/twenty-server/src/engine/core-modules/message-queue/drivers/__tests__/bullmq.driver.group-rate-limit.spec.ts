import {
  buildLabels,
  createFairnessHarness,
  silenceDriverLogs,
  ticketOf,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';
import { URGENT_FAIR_PRIORITY } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

jest.mock(
  'src/engine/core-modules/message-queue/message-queue-worker-config.constant',
  () => {
    const { MESSAGE_QUEUE_WORKER_CONFIG } = jest.requireActual(
      'src/engine/core-modules/message-queue/message-queue-worker-config.constant',
    );
    const { MessageQueue: ActualMessageQueue } = jest.requireActual(
      'src/engine/core-modules/message-queue/message-queue.constants',
    );

    return {
      MESSAGE_QUEUE_WORKER_CONFIG: {
        ...MESSAGE_QUEUE_WORKER_CONFIG,
        [ActualMessageQueue.logicFunctionQueue]: {
          ...MESSAGE_QUEUE_WORKER_CONFIG[ActualMessageQueue.logicFunctionQueue],
          groupRateLimits: { application: { max: 2, durationMs: 1_000 } },
        },
      },
    };
  },
);

const HERD_GROUP_KEYS = ['workspace:A', 'application:H'];

describe('BullMQDriver group rate limit', () => {
  beforeAll(silenceDriverLogs);

  it('delays the jobs of a limited key past its burst and runs them once due', async () => {
    const harness = await createFairnessHarness({
      isFairnessEnabled: false,
      isGroupRateLimitEnabled: true,
    });
    const labels = buildLabels({ prefix: 'H', count: 4 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      groupKeys: HERD_GROUP_KEYS,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      undefined,
      undefined,
      500,
      1_000,
    ]);
    expect(
      harness.metricsService.incrementCounterForEvent,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ key: MetricsKeys.JobGroupRatePaced }),
    );
    expect(await harness.processAll()).toEqual(['H1', 'H2']);

    harness.advanceTime({ milliseconds: 1_000 });

    expect(await harness.processAll()).toEqual(['H3', 'H4']);
  });

  it('keeps the fair ticket of a paced job, so once due it is ordered by its ticket against the other tenants', async () => {
    const harness = await createFairnessHarness({
      isFairnessEnabled: true,
      isGroupRateLimitEnabled: true,
    });

    await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'H', count: 4 }),
      workspaceId: 'A',
      groupKeys: HERD_GROUP_KEYS,
    });

    expect(harness.readPriority({ label: 'H3' })).toBe(ticketOf(2));
    expect(harness.readPriority({ label: 'H4' })).toBe(ticketOf(3));
    expect(await harness.processAll()).toEqual(['H1', 'H2']);

    harness.advanceTime({ milliseconds: 1_000 });
    await harness.enqueue({
      label: 'Q1',
      workspaceId: 'B',
      groupKeys: ['workspace:B', 'application:Q'],
    });

    expect(harness.readPriority({ label: 'Q1' })).toBe(ticketOf(1));
    expect(await harness.processAll()).toEqual(['Q1', 'H3', 'H4']);
  });

  it('leaves unlimited keys untouched', async () => {
    const harness = await createFairnessHarness({
      isFairnessEnabled: false,
      isGroupRateLimitEnabled: true,
    });

    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'A', count: 4 }),
      workspaceId: 'A',
    });

    expect(await harness.processAll()).toEqual(['A1', 'A2', 'A3', 'A4']);
  });

  it('keeps the longer of the caller delay and the paced delay', async () => {
    const harness = await createFairnessHarness({
      isFairnessEnabled: false,
      isGroupRateLimitEnabled: true,
    });
    const labels = buildLabels({ prefix: 'H', count: 4 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      groupKeys: HERD_GROUP_KEYS,
      delay: 700,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      700, 700, 700, 1_000,
    ]);
  });

  it('never paces the urgent lane', async () => {
    const harness = await createFairnessHarness({
      isFairnessEnabled: true,
      isGroupRateLimitEnabled: true,
    });

    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'U', count: 4 }),
      workspaceId: 'A',
      groupKeys: HERD_GROUP_KEYS,
      priority: URGENT_FAIR_PRIORITY,
    });

    expect(await harness.processAll()).toEqual(['U1', 'U2', 'U3', 'U4']);
  });

  it('does not pace when IS_WORKER_GROUP_RATE_LIMIT_ENABLED is off', async () => {
    const harness = await createFairnessHarness({ isFairnessEnabled: false });

    await harness.enqueueBulk({
      labels: buildLabels({ prefix: 'H', count: 4 }),
      workspaceId: 'A',
      groupKeys: HERD_GROUP_KEYS,
    });

    expect(await harness.processAll()).toEqual(['H1', 'H2', 'H3', 'H4']);
    expect(harness.readRangeTypes()).toEqual([]);
  });

  it('counts delayed jobs as already waiting when deduplicating by prefix', async () => {
    const harness = await createFairnessHarness({
      isFairnessEnabled: false,
      isGroupRateLimitEnabled: true,
    });

    await harness.enqueue({ label: 'H1', workspaceId: 'A', id: 'sync-H1' });

    expect(harness.readRangeTypes()).toEqual([
      ['waiting', 'paused', 'prioritized', 'delayed'],
    ]);
  });
});
