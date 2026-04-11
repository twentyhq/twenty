import {
  createTestModule,
  makeFastInstance,
  makeSlowInstance,
  makeWorkspace,
} from 'src/engine/core-modules/upgrade/services/__tests__/utils/upgrade-sequence-runner-test.util';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';

describe('UpgradeSequenceRunnerService — validation', () => {
  let runner: UpgradeSequenceRunnerService;
  let upgradeMigrationService: UpgradeMigrationService;
  let instanceUpgradeService: InstanceCommandRunnerService;
  let workspaceIteratorService: WorkspaceIteratorService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const testModule = await createTestModule();

    runner = testModule.runner;
    upgradeMigrationService = testModule.upgradeMigrationService;
    instanceUpgradeService = testModule.instanceUpgradeService;
    workspaceIteratorService = testModule.workspaceIteratorService;
  });

  describe('cursor resolution', () => {
    it('should throw when no migration history exists', async () => {
      (
        upgradeMigrationService.getLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockRejectedValue(new Error('No upgrade migration found'));

      await expect(
        runner.run({
          sequence: [makeFastInstance('Ic1')],
          activeWorkspaceIds: [],
          options: {},
        }),
      ).rejects.toThrow('No upgrade migration found');
    });

    it('should throw when cursor command is not in the sequence', async () => {
      (
        upgradeMigrationService.getLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue({ name: 'unknown-command', status: 'completed' });

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
      (
        upgradeMigrationService.getLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue({ name: 'Wc3', status: 'completed' });
      (
        upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue(
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
      (
        upgradeMigrationService.getLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue({ name: 'Ic1', status: 'completed' });
      (
        instanceUpgradeService.runFastInstanceCommand as jest.Mock
      ).mockResolvedValue({
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
      (
        upgradeMigrationService.getLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue({ name: 'Ic1', status: 'completed' });
      (
        instanceUpgradeService.runSlowInstanceCommand as jest.Mock
      ).mockResolvedValue({
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
      (
        upgradeMigrationService.getLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue({ name: 'Wc1', status: 'completed' });
      (
        upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue(
        new Map([['ws-1', { name: 'Wc1', status: 'completed' }]]),
      );
      (
        upgradeMigrationService.areAllWorkspacesAtCommand as jest.Mock
      ).mockResolvedValue(false);

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
      (
        upgradeMigrationService.getLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue({ name: 'Ic1', status: 'completed' });
      (
        upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue(
        new Map([['ws-1', { name: 'Wc1', status: 'completed' }]]),
      );
      (workspaceIteratorService.iterate as jest.Mock).mockResolvedValue({
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
      (
        upgradeMigrationService.getLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue({ name: 'Ic1', status: 'completed' });
      (
        upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue(
        new Map([['ws-1', { name: 'Wc1', status: 'completed' }]]),
      );
      (workspaceIteratorService.iterate as jest.Mock).mockResolvedValue({
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
      (
        upgradeMigrationService.getLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue({ name: 'Ic1', status: 'completed' });
      (
        upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow as jest.Mock
      ).mockResolvedValue(new Map());

      const report = await runner.run({
        sequence: [makeFastInstance('Ic1'), makeWorkspace('Wc1')],
        activeWorkspaceIds: ['ws-1'],
        options: {},
      });

      expect(report.totalFailures).toBe(1);
    });
  });
});
