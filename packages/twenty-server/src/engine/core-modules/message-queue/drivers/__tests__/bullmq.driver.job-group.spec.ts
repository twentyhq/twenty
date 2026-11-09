import {
  buildLabels,
  createFairnessHarness,
  silenceDriverLogs,
} from 'src/engine/core-modules/message-queue/drivers/__tests__/fairness-harness.test-util';

describe('BullMQDriver job groups', () => {
  beforeAll(silenceDriverLogs);

  it('splits the share of its workspace between job groups by weight', async () => {
    const harness = await createFairnessHarness();

    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'A', count: 6 }),
      workspaceId: 'W',
      jobGroup: { id: 'A', weight: 2 },
    });
    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'B', count: 6 }),
      workspaceId: 'W',
      jobGroup: { id: 'B', weight: 1 },
    });

    const order = await harness.processAll();

    expect(order.slice(0, 9)).toEqual([
      'A1',
      'B1',
      'A2',
      'A3',
      'A4',
      'B2',
      'A5',
      'A6',
      'B3',
    ]);
    expect(order).toHaveLength(12);
  });

  it('never gives a workspace more share than another one, whatever the weight of its job group', async () => {
    const harness = await createFairnessHarness();

    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'W', count: 4 }),
      workspaceId: 'W',
      jobGroup: { id: 'G', weight: 1_000 },
    });
    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'X', count: 4 }),
      workspaceId: 'X',
    });

    expect(await harness.processAll()).toEqual([
      'W1',
      'X1',
      'W2',
      'X2',
      'W3',
      'X3',
      'W4',
      'X4',
    ]);
  });

  it('shares the workspace between its job groups and its jobs without a group', async () => {
    const harness = await createFairnessHarness();

    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'G', count: 4 }),
      workspaceId: 'W',
      jobGroup: { id: 'G', weight: 3 },
    });
    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'U', count: 4 }),
      workspaceId: 'W',
    });
    await harness.enqueueMany({
      labels: buildLabels({ prefix: 'X', count: 4 }),
      workspaceId: 'X',
    });

    expect(await harness.processAll()).toEqual([
      'G1',
      'U1',
      'X1',
      'G2',
      'X2',
      'G3',
      'X3',
      'G4',
      'X4',
      'U2',
      'U3',
      'U4',
    ]);
  });

  it('paces the jobs of a job group to its maxRate on a queue without group config', async () => {
    const harness = await createFairnessHarness({
      isGroupRateLimitEnabled: true,
    });
    const labels = buildLabels({ prefix: 'G', count: 4 });

    await harness.enqueueBulk({
      labels,
      workspaceId: 'W',
      jobGroup: { id: 'G', maxRate: { max: 2, durationMs: 1_000 } },
    });

    expect(labels.map((label) => harness.readDelay({ label }))).toEqual([
      undefined,
      undefined,
      500,
      1_000,
    ]);
  });
});
