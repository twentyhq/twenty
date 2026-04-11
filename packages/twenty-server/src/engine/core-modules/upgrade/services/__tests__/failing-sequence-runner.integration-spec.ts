import {
  type IntegrationTestContext,
  createUpgradeSequenceRunnerIntegrationTestModule,
  DEFAULT_OPTIONS,
  makeFastInstance,
  makeSlowInstance,
  makeWorkspace,
  resetSeedSequenceCounter,
  seedMigration,
  WS_1,
  WS_2,
} from './utils/upgrade-sequence-runner-integration-test.util';

describe('UpgradeSequenceRunnerService — validation (integration)', () => {
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
    jest.clearAllMocks();
  });

  it('should throw when no migration history exists', async () => {
    const sequence = [makeFastInstance('Ic1')];

    await expect(
      context.runner.run({
        sequence,
        activeWorkspaceIds: [],
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow(
      'No upgrade migration found — the database may not have been initialized',
    );
  });

  it('should throw when cursor command is not found in the sequence', async () => {
    const sequence = [makeFastInstance('Ic1'), makeFastInstance('Ic2')];

    await seedMigration(context.dataSource, {
      name: 'RemovedCommand',
      status: 'completed',
    });

    await expect(
      context.runner.run({
        sequence,
        activeWorkspaceIds: [],
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow('Step "RemovedCommand" not found in upgrade sequence');
  });

  it('should throw when workspace cursors are outside the current slice', async () => {
    // Sequence: [Wc1, Wc2, Ic1, Wc3, Wc4]
    // WS_1 completed up to Wc4 (in slice [Wc3, Wc4])
    // WS_2 only completed Wc1 (in slice [Wc1, Wc2]) — misaligned
    const sequence = [
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
      makeFastInstance('Ic1'),
      makeWorkspace('Wc3'),
      makeWorkspace('Wc4'),
    ];

    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc2',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_2,
    });
    await seedMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
    });
    await seedMigration(context.dataSource, {
      name: 'Wc3',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc4',
      status: 'completed',
      workspaceId: WS_1,
    });

    await expect(
      context.runner.run({
        sequence,
        activeWorkspaceIds: [WS_1, WS_2],
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow('workspaces are not aligned');
  });

  it('should throw when an active workspace has no migration history', async () => {
    const sequence = [makeFastInstance('Ic1'), makeWorkspace('Wc1')];

    // Only seed instance command — WS_2 has no workspace migration rows
    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });

    await expect(
      context.runner.run({
        sequence,
        activeWorkspaceIds: [WS_1, WS_2],
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow('No upgrade migration found for workspace(s)');
  });

  it('should throw when workspace sync barrier is not met', async () => {
    // Sequence: [Wc1, Ic1] — barrier requires all workspaces to have completed Wc1
    // WS_1 completed Wc1, WS_2 has not
    const sequence = [makeWorkspace('Wc1'), makeFastInstance('Ic1')];

    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });
    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'failed',
      workspaceId: WS_2,
    });

    await expect(
      context.runner.run({
        sequence,
        activeWorkspaceIds: [WS_1, WS_2],
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow(
      'Cannot run instance step: not all workspaces have completed "Wc1"',
    );
  });

  it('should throw when a fast instance command fails', async () => {
    const sequence = [makeFastInstance('Ic1'), makeFastInstance('Ic2')];

    await seedMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
    });

    const error = new Error('fast command exploded');

    context.instanceUpgradeService.runFastInstanceCommand.mockResolvedValueOnce(
      { status: 'failed', error },
    );

    await expect(
      context.runner.run({
        sequence,
        activeWorkspaceIds: [],
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow('fast command exploded');
  });

  it('should throw when a slow instance command fails', async () => {
    const sequence = [makeFastInstance('Ic1'), makeSlowInstance('Ic2')];

    await seedMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
    });

    const error = new Error('slow command exploded');

    context.instanceUpgradeService.runSlowInstanceCommand.mockResolvedValueOnce(
      { status: 'failed', error },
    );

    await expect(
      context.runner.run({
        sequence,
        activeWorkspaceIds: [],
        options: DEFAULT_OPTIONS,
      }),
    ).rejects.toThrow('slow command exploded');
  });

  it('should abort and report failures when workspace commands fail', async () => {
    // Sequence: [Wc1, Ic1] — if Wc1 fails for a workspace, runner should
    // report the failure and not proceed to Ic1
    const sequence = [makeWorkspace('Wc1'), makeFastInstance('Ic1')];

    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'failed',
      workspaceId: WS_1,
    });

    context.workspaceUpgradeService.runWorkspaceCommands.mockRejectedValueOnce(
      new Error('workspace command exploded'),
    );

    const report = await context.runner.run({
      sequence,
      activeWorkspaceIds: [WS_1],
      options: DEFAULT_OPTIONS,
    });

    expect(report.totalFailures).toBe(1);
    expect(report.totalSuccesses).toBe(0);
    expect(
      context.instanceUpgradeService.runFastInstanceCommand,
    ).not.toHaveBeenCalled();
  });
});
