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
} from './utils/upgrade-sequence-runner-integration-test.util';

describe('UpgradeSequenceRunnerService — execution (integration)', () => {
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

  it('should resume from a completed instance command and run remaining steps', async () => {
    const sequence = [
      makeFastInstance('Ic1'),
      makeFastInstance('Ic2'),
      makeSlowInstance('Ic3'),
    ];

    await seedMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
    });
    await seedMigration(context.dataSource, {
      name: 'Ic2',
      status: 'completed',
    });

    const report = await context.runner.run({
      sequence,
      activeWorkspaceIds: [],
      options: DEFAULT_OPTIONS,
    });

    expect(report).toEqual({ totalSuccesses: 0, totalFailures: 0 });
    expect(
      context.instanceUpgradeService.runSlowInstanceCommand,
    ).toHaveBeenCalledTimes(1);
    expect(
      context.instanceUpgradeService.runSlowInstanceCommand,
    ).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ic3' }));
    expect(
      context.instanceUpgradeService.runFastInstanceCommand,
    ).not.toHaveBeenCalled();
  });

  it('should retry a failed instance command', async () => {
    const sequence = [makeFastInstance('Ic1'), makeFastInstance('Ic2')];

    await seedMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
    });
    await seedMigration(context.dataSource, {
      name: 'Ic2',
      status: 'failed',
    });

    const report = await context.runner.run({
      sequence,
      activeWorkspaceIds: [],
      options: DEFAULT_OPTIONS,
    });

    expect(report).toEqual({ totalSuccesses: 0, totalFailures: 0 });
    expect(
      context.instanceUpgradeService.runFastInstanceCommand,
    ).toHaveBeenCalledTimes(1);
    expect(
      context.instanceUpgradeService.runFastInstanceCommand,
    ).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ic2' }));
  });

  it('should resume workspace commands from per-workspace cursors', async () => {
    const sequence = [
      makeFastInstance('Ic1'),
      makeWorkspace('Wc1'),
      makeWorkspace('Wc2'),
    ];

    await seedMigration(context.dataSource, {
      name: 'Ic1',
      status: 'completed',
    });
    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });

    const report = await context.runner.run({
      sequence,
      activeWorkspaceIds: [WS_1],
      options: DEFAULT_OPTIONS,
    });

    expect(report).toEqual({ totalSuccesses: 1, totalFailures: 0 });
    expect(
      context.workspaceUpgradeService.runWorkspaceCommands,
    ).toHaveBeenCalledTimes(1);
    expect(
      context.workspaceUpgradeService.runWorkspaceCommands,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceCommands: expect.arrayContaining([
          expect.objectContaining({ name: 'Wc2' }),
        ]),
      }),
    );

    const callArgs =
      context.workspaceUpgradeService.runWorkspaceCommands.mock.calls[0][0];

    expect(
      callArgs.workspaceCommands.find((command: any) => command.name === 'Wc1'),
    ).toBeUndefined();
  });

  it('should enforce workspace sync barrier before instance step', async () => {
    const sequence = [makeWorkspace('Wc1'), makeFastInstance('Ic1')];

    await seedMigration(context.dataSource, {
      name: 'Wc1',
      status: 'completed',
      workspaceId: WS_1,
    });

    const report = await context.runner.run({
      sequence,
      activeWorkspaceIds: [WS_1],
      options: DEFAULT_OPTIONS,
    });

    expect(report).toEqual({ totalSuccesses: 1, totalFailures: 0 });
    expect(
      context.instanceUpgradeService.runFastInstanceCommand,
    ).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ic1' }));
  });
});
