import {
  type IntegrationTestContext,
  createUpgradeSequenceRunnerIntegrationTestModule,
  DEFAULT_OPTIONS,
  makeFastInstance,
  makeSlowInstance,
  makeWorkspace,
  migrationRecordToKey,
  resetSeedSequenceCounter,
  seedMigration,
  setMockActiveWorkspaceIds,
  testGetExecutedMigrationsInOrder,
  WS_1,
  WS_2,
  WS_3,
} from './utils/upgrade-sequence-runner-integration-test.util';

describe('UpgradeSequenceRunnerService — workspace segment alignment (integration)', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createUpgradeSequenceRunnerIntegrationTestModule();
  }, 30000);

  afterAll(async () => {
    await context.dataSource.query('DELETE FROM core."upgradeMigration"');
    await context.module?.close();
    await context.dataSource?.destroy();
  }, 15000);

  beforeEach(async () => {
    await context.dataSource.query('DELETE FROM core."upgradeMigration"');
    resetSeedSequenceCounter();
    setMockActiveWorkspaceIds([]);
    jest.restoreAllMocks();
  });

  it('should upgrade all workspaces when they are in the same segment at different positions', async () => {
    // Sequence: Ic0 → Wc0 → Wc1 → Wc2 → Ic1 → Ic2 → Wc3 → Wc4
    const sequence = [
      makeFastInstance('Ic0'),
      makeWorkspace('Wc0'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
      makeFastInstance('Ic1'),
      makeSlowInstance('Ic2'),
      makeWorkspace('Wc3'),
      makeWorkspace('Wc4'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2, WS_3]);

    // Seed: Ic0 completed (instance command)
    await seedMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
    });

    // WS_1: at Wc0, completed
    await seedMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });

    // WS_2: at Wc1, failed (needs retry)
    await seedMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_2,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'failed',
      workspaceId: WS_2,
    });

    // WS_3: at Wc2, completed (most advanced in segment)
    await seedMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_3,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_3,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc2',
      status: 'completed',
      workspaceId: WS_3,
    });

    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        workspaceIds: [WS_1, WS_2, WS_3],
      },
    });

    expect(report.totalFailures).toBe(0);

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic0:instance:completed:1',
      `Wc0:${WS_1}:completed:1`,
      `Wc0:${WS_2}:completed:1`,
      `Wc1:${WS_2}:failed:1`,
      `Wc0:${WS_3}:completed:1`,
      `Wc1:${WS_3}:completed:1`,
      `Wc2:${WS_3}:completed:1`,

      // Segment A: WS_1 runs Wc1, Wc2; WS_2 retries Wc1, runs Wc2; WS_3 already done
      `Wc1:${WS_1}:completed:1`,
      `Wc2:${WS_1}:completed:1`,
      `Wc1:${WS_2}:completed:2`,
      `Wc2:${WS_2}:completed:1`,

      // Sync barrier → instance steps
      'Ic1:instance:completed:1',
      'Ic2:instance:completed:1',

      // Segment B: all workspaces run Wc3, Wc4
      `Wc3:${WS_1}:completed:1`,
      `Wc4:${WS_1}:completed:1`,
      `Wc3:${WS_2}:completed:1`,
      `Wc4:${WS_2}:completed:1`,
      `Wc3:${WS_3}:completed:1`,
      `Wc4:${WS_3}:completed:1`,
    ]);
  });

  it('should reject workspaces with cursors ahead of the current segment', async () => {
    // Sequence: Ic0 → Wc0 → Wc1 → Ic1 → Wc2 → Wc3
    const sequence = [
      makeFastInstance('Ic0'),
      makeWorkspace('Wc0'),
      makeWorkspace('Wc1'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc2'),
      makeWorkspace('Wc3'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    // Seed: Ic0 completed
    await seedMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
    });

    // WS_1: at Wc0 (in segment A) - correct
    await seedMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });

    // WS_2: at Wc2 (in segment B) - WRONG! Ahead of current segment
    await seedMigration(context.dataSource, {
      name: 'Wc2',
      status: 'completed',
      workspaceId: WS_2,
      isInitial: true,
    });

    await expect(
      context.runner.run({
        sequence,
        options: {
          ...DEFAULT_OPTIONS,
          workspaceIds: [WS_1, WS_2],
        },
      }),
    ).rejects.toThrow(
      /workspace\(s\) have cursors outside the current segment/,
    );
  });

  it('should reject workspaces with cursors behind the current segment', async () => {
    // Sequence: Wc-1 → Ic0 → Wc0 → Wc1 → Ic1 → Wc2
    const sequence = [
      makeWorkspace('Wc-1'),
      makeFastInstance('Ic0'),
      makeWorkspace('Wc0'),
      makeWorkspace('Wc1'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc2'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    // Seed: Ic0 completed
    await seedMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
    });

    // WS_1: at Wc0 (in segment after Ic0) - correct
    await seedMigration(context.dataSource, {
      name: 'Wc0',
      status: 'completed',
      workspaceId: WS_1,
    });

    // WS_2: at Wc-1 (in segment before Ic0) - WRONG! Behind current segment
    await seedMigration(context.dataSource, {
      name: 'Wc-1',
      status: 'completed',
      workspaceId: WS_2,
    });

    await expect(
      context.runner.run({
        sequence,
        options: {
          ...DEFAULT_OPTIONS,
          workspaceIds: [WS_1, WS_2],
        },
      }),
    ).rejects.toThrow(
      /workspace\(s\) have cursors outside the current segment/,
    );
  });

  it('should handle workspaces created at correct segment via isInitial', async () => {
    // Sequence: Wc0 → Ic0 → Ic1 → Wc1 → Wc2
    // If Ic1 is the last completed instance command, new workspaces should be at Wc1 or Wc2
    const sequence = [
      makeWorkspace('Wc0'),
      makeFastInstance('Ic0'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
    ];

    setMockActiveWorkspaceIds([WS_1, WS_2]);

    // Seed: Ic0 and Ic1 completed
    await seedMigration(context.dataSource, {
      name: 'Ic0',
      status: 'completed',
    });
    await seedMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
    });

    // WS_1: at Wc1 (in correct segment after Ic1)
    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });

    // WS_2: newly created with isInitial at Wc2 (correct segment after Ic1)
    await seedMigration(context.dataSource, {
      name: 'Wc2',
      status: 'completed',
      workspaceId: WS_2,
      isInitial: true,
    });

    const report = await context.runner.run({
      sequence,
      options: {
        ...DEFAULT_OPTIONS,
        workspaceIds: [WS_1, WS_2],
      },
    });

    expect(report.totalFailures).toBe(0);

    const executed = await testGetExecutedMigrationsInOrder(context.dataSource);

    expect(executed.map(migrationRecordToKey)).toStrictEqual([
      // Seeds
      'Ic0:instance:completed:1',
      'Ic1:instance:completed:1',
      `Wc1:${WS_1}:completed:1`,
      `Wc2:${WS_2}:completed:1:initial`,

      // WS_1 runs Wc2, WS_2 already at Wc2 (no new commands needed)
      `Wc2:${WS_1}:completed:1`,
    ]);
  });
});
