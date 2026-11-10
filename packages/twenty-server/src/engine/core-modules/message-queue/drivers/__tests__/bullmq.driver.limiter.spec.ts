import {
  buildLabels,
  createFairnessHarness,
  silenceDriverLogs,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';
import { URGENT_FAIR_PRIORITY } from 'src/engine/core-modules/message-queue/drivers/fairness/fair-priority.constant';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const LIMITER = { key: 'workflow:W1', max: 2, durationMs: 1_000 };

describe('BullMQDriver limiter', () => {
  beforeAll(silenceDriverLogs);

  it('delays the jobs past the burst and runs them once due', async () => {
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
        labels: buildLabels({ prefix, count: 3 }),
        workspaceId,
        applicationUniversalIdentifier,
        limiter: LIMITER,
      });
    }

    expect(
      ['A3', 'B3', 'Q3'].map((label) => harness.readDelay({ label })),
    ).toEqual([500, 500, 500]);
  });

  it('starts pacing at the caller delay, so the burst is never exceeded once the jobs are due', async () => {
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
      700, 700, 1_200, 1_700,
    ]);
  });

  it('does not reserve a slot again for a job id that is already queued', async () => {
    const harness = await createFairnessHarness({
      isGroupLimiterEnabled: true,
    });
    const jobIds = ['job-1', 'job-2', 'job-3'];
    const firstEnqueuedAt = Date.now();

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

    // Redis TIME is the real clock, so the remaining delay shrinks while the test runs.
    const elapsedMs = Date.now() - firstEnqueuedAt;
    const freshJobDelay = harness.readDelay({ label: 'F1' }) ?? 0;

    expect(harness.readDelay({ label: 'H3' })).toBe(500);
    expect(freshJobDelay).toBeGreaterThan(900 - elapsedMs);
    expect(freshJobDelay).toBeLessThanOrEqual(1_000);
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
