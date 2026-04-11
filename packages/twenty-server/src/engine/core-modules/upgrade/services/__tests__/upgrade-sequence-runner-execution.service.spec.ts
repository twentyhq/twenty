import {
  createTestModule,
  makeFastInstance,
  makeSlowInstance,
  makeWorkspace,
} from 'src/engine/core-modules/upgrade/services/__tests__/utils/upgrade-sequence-runner-test.util';

type TestModule = Awaited<ReturnType<typeof createTestModule>>;

describe('UpgradeSequenceRunnerService — execution', () => {
  let runner: TestModule['runner'];
  let upgradeMigrationService: TestModule['upgradeMigrationService'];
  let instanceUpgradeService: TestModule['instanceUpgradeService'];
  let workspaceUpgradeService: TestModule['workspaceUpgradeService'];
  let workspaceIteratorService: TestModule['workspaceIteratorService'];

  beforeEach(async () => {
    jest.clearAllMocks();

    const testModule = await createTestModule();

    runner = testModule.runner;
    upgradeMigrationService = testModule.upgradeMigrationService;
    instanceUpgradeService = testModule.instanceUpgradeService;
    workspaceUpgradeService = testModule.workspaceUpgradeService;
    workspaceIteratorService = testModule.workspaceIteratorService;
  });

  describe('empty sequence', () => {
    it('should return zero counts when sequence is empty', async () => {
      const report = await runner.run({
        sequence: [],
        activeWorkspaceIds: ['ws-1'],
        options: {},
      });

      expect(report).toEqual({ totalSuccesses: 0, totalFailures: 0 });
    });
  });

  describe('cursor resolution', () => {
    it('should start after the last completed instance command', async () => {
      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Ic1', status: 'completed' },
      );

      await runner.run({
        sequence: [makeFastInstance('Ic1'), makeFastInstance('Ic2')],
        activeWorkspaceIds: [],
        options: {},
      });

      expect(
        instanceUpgradeService.runFastInstanceCommand,
      ).toHaveBeenCalledTimes(1);
      expect(
        instanceUpgradeService.runFastInstanceCommand,
      ).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ic2' }));
    });

    it('should re-run the last failed instance command', async () => {
      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Ic2', status: 'failed' },
      );

      await runner.run({
        sequence: [
          makeFastInstance('Ic1'),
          makeFastInstance('Ic2'),
          makeFastInstance('Ic3'),
        ],
        activeWorkspaceIds: [],
        options: {},
      });

      expect(
        instanceUpgradeService.runFastInstanceCommand,
      ).toHaveBeenCalledTimes(2);
      expect(
        instanceUpgradeService.runFastInstanceCommand,
      ).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ name: 'Ic2' }),
      );
      expect(
        instanceUpgradeService.runFastInstanceCommand,
      ).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ name: 'Ic3' }),
      );
    });

    it('should start at workspace slice start when cursor is on a workspace step', async () => {
      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Wc2', status: 'completed' },
      );
      upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow.mockResolvedValue(
        new Map([['ws-1', { name: 'Wc2', status: 'completed' }]]),
      );

      await runner.run({
        sequence: [
          makeFastInstance('Ic1'),
          makeWorkspace('Wc1'),
          makeWorkspace('Wc2'),
          makeWorkspace('Wc3'),
        ],
        activeWorkspaceIds: ['ws-1'],
        options: {},
      });

      expect(
        workspaceUpgradeService.runWorkspaceCommands,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceCommands: [expect.objectContaining({ name: 'Wc3' })],
        }),
      );
    });
  });

  describe('workspace cursor alignment — accepted cases', () => {
    it('should accept workspace cursors within the same slice', async () => {
      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Wc3', status: 'completed' },
      );
      upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow.mockResolvedValue(
        new Map([
          ['ws-1', { name: 'Wc3', status: 'completed' }],
          ['ws-2', { name: 'Wc2', status: 'completed' }],
        ]),
      );

      await expect(
        runner.run({
          sequence: [
            makeFastInstance('Ic1'),
            makeWorkspace('Wc2'),
            makeWorkspace('Wc3'),
          ],
          activeWorkspaceIds: ['ws-1', 'ws-2'],
          options: {},
        }),
      ).resolves.not.toThrow();
    });

    it('should accept a failed workspace cursor within the same slice', async () => {
      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Wc2', status: 'failed' },
      );
      upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow.mockResolvedValue(
        new Map([
          ['ws-1', { name: 'Wc2', status: 'failed' }],
          ['ws-2', { name: 'Wc1', status: 'completed' }],
        ]),
      );

      await expect(
        runner.run({
          sequence: [
            makeFastInstance('Ic1'),
            makeWorkspace('Wc1'),
            makeWorkspace('Wc2'),
          ],
          activeWorkspaceIds: ['ws-1', 'ws-2'],
          options: {},
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('full sequence execution', () => {
    it('should run instance and workspace steps in correct order', async () => {
      const executionOrder: string[] = [];

      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Ic1', status: 'completed' },
      );
      upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow.mockResolvedValue(
        new Map([['ws-1', { name: 'Wc1', status: 'completed' }]]),
      );

      instanceUpgradeService.runFastInstanceCommand.mockImplementation(
        async () => {
          executionOrder.push('fast-instance');

          return { status: 'success' };
        },
      );
      instanceUpgradeService.runSlowInstanceCommand.mockImplementation(
        async () => {
          executionOrder.push('slow-instance');

          return { status: 'success' };
        },
      );
      workspaceUpgradeService.runWorkspaceCommands.mockImplementation(
        async () => {
          executionOrder.push('workspace');
        },
      );

      await runner.run({
        sequence: [
          makeFastInstance('Ic1'),
          makeSlowInstance('Sc1'),
          makeWorkspace('Wc1'),
          makeWorkspace('Wc2'),
        ],
        activeWorkspaceIds: ['ws-1'],
        options: {},
      });

      expect(executionOrder).toEqual(['slow-instance', 'workspace']);
    });

    it('should pass skipDataMigration true when no active workspaces exist', async () => {
      upgradeMigrationService.getLastAttemptedCommandNameOrThrow.mockResolvedValue(
        { name: 'Ic1', status: 'completed' },
      );
      upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow.mockResolvedValue(
        new Map(),
      );

      await runner.run({
        sequence: [
          makeFastInstance('Ic1'),
          makeSlowInstance('Sc1'),
          makeWorkspace('Wc1'),
        ],
        activeWorkspaceIds: [],
        options: {},
      });

      expect(
        instanceUpgradeService.runSlowInstanceCommand,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ skipDataMigration: true }),
      );
    });
  });
});
