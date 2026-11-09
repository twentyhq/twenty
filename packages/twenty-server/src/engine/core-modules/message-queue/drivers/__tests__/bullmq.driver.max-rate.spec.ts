import {
  buildLabels,
  createFairnessHarness,
  silenceDriverLogs,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';
import { URGENT_FAIR_PRIORITY } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const MAX_RATE = { key: 'workflow:W1', max: 2, durationMs: 1_000 };

describe('BullMQDriver maxRate', () => {
  beforeAll(silenceDriverLogs);

  it('delays the jobs past the burst and runs them once due', async () => {
    const harness = await createFairnessHarness({
      isGroupMaxRateEnabled: true,
    });
    const labels = buildLabels({ prefix: 'H', count: 4 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      maxRate: MAX_RATE,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      undefined,
      undefined,
      500,
      1_000,
    ]);
    expect(
      harness.metricsService.incrementCounterForEvent.mock.calls.filter(
        ([{ key }]) => key === MetricsKeys.JobGroupRatePaced,
      ),
    ).toHaveLength(1);
    expect(await harness.processAll()).toEqual(['H1', 'H2']);

    harness.advanceTime({ milliseconds: 1_000 });

    expect(await harness.processAll()).toEqual(['H3', 'H4']);
  });

  it('gives each workspace and each application its own budget for the same key', async () => {
    const harness = await createFairnessHarness({
      isGroupMaxRateEnabled: true,
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
        labels: buildLabels({ prefix, count: 3 }),
        workspaceId,
        applicationUniversalIdentifier,
        maxRate: MAX_RATE,
      });
    }

    expect(
      ['A3', 'B3', 'Q3'].map((label) => harness.readDelay({ label })),
    ).toEqual([500, 500, 500]);
  });

  it('keeps the longer of the caller delay and the paced delay', async () => {
    const harness = await createFairnessHarness({
      isGroupMaxRateEnabled: true,
    });
    const labels = buildLabels({ prefix: 'H', count: 4 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      maxRate: MAX_RATE,
      delay: 700,
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      700, 700, 700, 1_000,
    ]);
  });

  it('never paces the urgent lane', async () => {
    const harness = await createFairnessHarness({
      isGroupMaxRateEnabled: true,
    });

    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'U', count: 4 }),
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      priority: URGENT_FAIR_PRIORITY,
      maxRate: MAX_RATE,
    });

    expect(await harness.processAll()).toEqual(['U1', 'U2', 'U3', 'U4']);
  });

  it('does not pace when IS_WORKER_GROUP_MAX_RATE_ENABLED is off', async () => {
    const harness = await createFairnessHarness();
    const labels = buildLabels({ prefix: 'H', count: 4 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      maxRate: MAX_RATE,
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
