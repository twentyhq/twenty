import {
  createMocks,
  makeFastInstance,
  makeSlowInstance,
  makeWorkspace,
} from 'src/engine/core-modules/upgrade/services/__tests__/utils/upgrade-sequence-runner-test.util';

describe('UpgradeSequenceRunnerService — validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cursor resolution', () => {
    it('should throw when no migration history exists', async () => {
      const { runner, upgradeMigrationService } = createMocks();

      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockRejectedValue(
        new Error('No upgrade migration found'),
      );

      await expect(
        runner.run({
          sequence: [makeFastInstance('Ic1')],
          activeWorkspaceIds: [],
          options: {},
        }),
      ).rejects.toThrow('No upgrade migration found');
    });

    it('should throw when cursor command is not in the sequence', async () => {
      const { runner, upgradeMigrationService } = createMocks();

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
      const { runner, upgradeMigrationService } = createMocks();

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
      const { runner, upgradeMigrationService, instanceUpgradeService } =
        createMocks();

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
      const { runner, upgradeMigrationService, instanceUpgradeService } =
        createMocks();

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

  describe('workspace sync barrier', () => {
    it('should throw when not all workspaces completed the previous workspace slice', async () => {
      const { runner, upgradeMigrationService } = createMocks();

      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Wc1', status: 'completed' },
      );
      upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow.mockResolvedValue(
        new Map([['ws-1', { name: 'Wc1', status: 'completed' }]]),
      );
      upgradeMigrationService.areAllWorkspacesAtCommand.mockResolvedValue(
        false,
      );

      await expect(
        runner.run({
          sequence: [makeWorkspace('Wc1'), makeFastInstance('Ic1')],
          activeWorkspaceIds: ['ws-1'],
          options: {},
        }),
      ).rejects.toThrow('not all workspaces have completed');
    });
  });

  describe('workspace iteration failures', () => {
    it('should abort and report failures when workspace iteration fails', async () => {
      const { runner, upgradeMigrationService, workspaceIteratorService } =
        createMocks();

      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Ic1', status: 'completed' },
      );
      upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow.mockResolvedValue(
        new Map([['ws-1', { name: 'Wc1', status: 'completed' }]]),
      );

      workspaceIteratorService.iterate.mockResolvedValue({
        success: [],
        fail: [{ workspaceId: 'ws-1', error: new Error('fail') }],
      });

      const report = await runner.run({
        sequence: [
          makeFastInstance('Ic1'),
          makeWorkspace('Wc1'),
          makeWorkspace('Wc2'),
          makeFastInstance('Ic2'),
        ],
        activeWorkspaceIds: ['ws-1'],
        options: {},
      });

      expect(report.totalFailures).toBe(1);
      expect(report.totalSuccesses).toBe(0);
    });

    it('should not proceed to next instance step after workspace failure', async () => {
      const {
        runner,
        upgradeMigrationService,
        instanceUpgradeService,
        workspaceIteratorService,
      } = createMocks();

      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Ic1', status: 'completed' },
      );
      upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow.mockResolvedValue(
        new Map([['ws-1', { name: 'Wc1', status: 'completed' }]]),
      );

      workspaceIteratorService.iterate.mockResolvedValue({
        success: [],
        fail: [{ workspaceId: 'ws-1', error: new Error('fail') }],
      });

      await runner.run({
        sequence: [
          makeFastInstance('Ic1'),
          makeWorkspace('Wc1'),
          makeWorkspace('Wc2'),
          makeFastInstance('Ic2'),
        ],
        activeWorkspaceIds: ['ws-1'],
        options: {},
      });

      expect(
        instanceUpgradeService.runFastInstanceCommand,
      ).not.toHaveBeenCalled();
    });
  });

  describe('missing workspace cursor', () => {
    it('should throw when a workspace has no cursor in the map', async () => {
      const { runner, upgradeMigrationService } = createMocks();

      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Ic1', status: 'completed' },
      );
      upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow.mockResolvedValue(
        new Map(),
      );

      const report = await runner.run({
        sequence: [makeFastInstance('Ic1'), makeWorkspace('Wc1')],
        activeWorkspaceIds: ['ws-1'],
        options: {},
      });

      expect(report.totalFailures).toBe(1);
    });
  });
});
