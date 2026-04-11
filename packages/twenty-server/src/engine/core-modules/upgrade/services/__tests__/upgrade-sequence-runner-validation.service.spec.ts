import {
  createUpgradeSequenceRunnerTestModule,
  makeFastInstance,
  makeSlowInstance,
  makeWorkspace,
} from 'src/engine/core-modules/upgrade/services/__tests__/utils/upgrade-sequence-runner-test.util';

type TestModule = Awaited<
  ReturnType<typeof createUpgradeSequenceRunnerTestModule>
>;

describe('UpgradeSequenceRunnerService — validation', () => {
  let runner: TestModule['runner'];
  let upgradeMigrationService: TestModule['upgradeMigrationService'];
  let instanceUpgradeService: TestModule['instanceUpgradeService'];
  let workspaceUpgradeService: TestModule['workspaceUpgradeService'];

  beforeEach(async () => {
    jest.clearAllMocks();

    const testModule = await createUpgradeSequenceRunnerTestModule();

    runner = testModule.runner;
    upgradeMigrationService = testModule.upgradeMigrationService;
    instanceUpgradeService = testModule.instanceUpgradeService;
    workspaceUpgradeService = testModule.workspaceUpgradeService;
  });

  describe('cursor resolution', () => {
    it('should throw when cursor command is not in the sequence', async () => {
      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'unknown-command', status: 'completed' },
      );

      await expect(
        runner.run({
          sequence: [makeFastInstance('Ic1')],
          activeWorkspaceIds: [],
          options: {},
        }),
      ).rejects.toThrow('not found in upgrade sequence');
    });
  });

  describe('workspace cursor alignment', () => {
    it('should throw when a workspace cursor is outside the current workspace slice', async () => {
      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Wc3', status: 'completed' },
      );
      upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow.mockResolvedValue(
        new Map([
          ['ws-1', { name: 'Wc3', status: 'completed' }],
          ['ws-2', { name: 'Wc1', status: 'completed' }],
        ]),
      );

      await expect(
        runner.run({
          sequence: [
            makeFastInstance('Ic1'),
            makeWorkspace('Wc1'),
            makeFastInstance('Ic2'),
            makeWorkspace('Wc2'),
            makeWorkspace('Wc3'),
          ],
          activeWorkspaceIds: ['ws-1', 'ws-2'],
          options: {},
        }),
      ).rejects.toThrow('workspaces are not aligned');
    });
  });

  describe('instance step failures', () => {
    it('should throw when a fast instance command fails', async () => {
      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Ic1', status: 'completed' },
      );
      instanceUpgradeService.runFastInstanceCommand.mockResolvedValue({
        status: 'failed',
        error: new Error('SQL error'),
      });

      await expect(
        runner.run({
          sequence: [makeFastInstance('Ic1'), makeFastInstance('Ic2')],
          activeWorkspaceIds: [],
          options: {},
        }),
      ).rejects.toThrow('SQL error');
    });

    it('should throw when a slow instance command fails', async () => {
      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Ic1', status: 'completed' },
      );
      instanceUpgradeService.runSlowInstanceCommand.mockResolvedValue({
        status: 'failed',
        error: new Error('Data migration error'),
      });

      await expect(
        runner.run({
          sequence: [makeFastInstance('Ic1'), makeSlowInstance('Sc1')],
          activeWorkspaceIds: [],
          options: {},
        }),
      ).rejects.toThrow('Data migration error');
    });
  });

  describe('workspace iteration failures', () => {
    it('should report partial failure and abort before next instance step', async () => {
      const workspaceIds = ['ws-1', 'ws-2', 'ws-3'];

      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Ic1', status: 'completed' },
      );
      upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow.mockResolvedValue(
        new Map([
          ['ws-1', { name: 'Wc1', status: 'completed' }],
          ['ws-2', { name: 'Wc1', status: 'completed' }],
          ['ws-3', { name: 'Wc1', status: 'completed' }],
        ]),
      );

      workspaceUpgradeService.runWorkspaceCommands.mockImplementation(
        async ({ iteratorContext }) => {
          if (iteratorContext.workspaceId === 'ws-2') {
            throw new Error('workspace ws-2 migration failed');
          }
        },
      );

      const report = await runner.run({
        sequence: [
          makeFastInstance('Ic1'),
          makeWorkspace('Wc1'),
          makeWorkspace('Wc2'),
          makeFastInstance('Ic2'),
        ],
        activeWorkspaceIds: workspaceIds,
        options: { workspaceId: new Set(workspaceIds) },
      });

      expect(report.totalFailures).toBe(1);
      expect(report.totalSuccesses).toBe(2);
      expect(
        workspaceUpgradeService.runWorkspaceCommands,
      ).toHaveBeenCalledTimes(3);
      expect(
        instanceUpgradeService.runFastInstanceCommand,
      ).not.toHaveBeenCalled();
    });
  });
});
