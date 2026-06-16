import 'reflect-metadata';

import {
  type UpgradeStep,
  UpgradeSequenceReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import { WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { UpgradeAwareEntityMetadataAdapter } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-entity-metadata.adapter';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';
import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';

const VERSION = TWENTY_CURRENT_VERSION;
const noopAsync = async () => {};

const makeFastInstanceStep = (name: string): UpgradeStep =>
  ({
    kind: 'fast-instance',
    name,
    command: { up: noopAsync, down: noopAsync },
    version: VERSION,
    timestamp: 0,
  }) as unknown as UpgradeStep;

const makeWorkspaceStep = (name: string): UpgradeStep =>
  ({
    kind: 'workspace',
    name,
    command: { runOnWorkspace: noopAsync },
    version: VERSION,
    timestamp: 0,
  }) as unknown as UpgradeStep;

const buildRunner = ({
  lastAttemptedCommand,
  completedInstanceCommands,
  workspaceCursorsByWorkspaceId,
  workspaceIds = ['ws-1'],
}: {
  lastAttemptedCommand: { name: string; status: 'completed' | 'failed' };
  completedInstanceCommands: Set<string>;
  workspaceCursorsByWorkspaceId: Map<
    string,
    { workspaceId: string; name: string; status: 'completed' | 'failed'; executedByVersion: string; errorMessage: null; createdAt: Date; isInitial: boolean }
  >;
  workspaceIds?: string[];
}): {
  runner: UpgradeSequenceRunnerService;
  runFastInstanceCommandMock: jest.Mock;
  runWorkspaceCommandsMock: jest.Mock;
} => {
  const runFastInstanceCommandMock = jest.fn().mockResolvedValue({ status: 'success' });
  const runWorkspaceCommandsMock = jest.fn().mockResolvedValue(undefined);

  const upgradeMigrationService = {
    getLastAttemptedCommandNameOrThrow: jest.fn().mockResolvedValue(lastAttemptedCommand),
    getWorkspaceLastAttemptedCommandNameOrThrow: jest.fn().mockResolvedValue(workspaceCursorsByWorkspaceId),
    isLastAttemptCompleted: jest.fn(({ name }: { name: string; workspaceId: null }) =>
      Promise.resolve(completedInstanceCommands.has(name)),
    ),
  } as unknown as UpgradeMigrationService;

  const instanceCommandRunnerService = {
    runFastInstanceCommand: runFastInstanceCommandMock,
    runSlowInstanceCommand: jest.fn().mockResolvedValue({ status: 'success' }),
  } as unknown as InstanceCommandRunnerService;

  const workspaceCommandRunnerService = {
    runWorkspaceCommands: runWorkspaceCommandsMock,
  } as unknown as WorkspaceCommandRunnerService;

  const upgradeSequenceReaderService = new UpgradeSequenceReaderService(
    null as never,
  );

  const upgradeAwareEntityMetadataAdapter = {
    refresh: jest.fn().mockResolvedValue(undefined),
  } as unknown as UpgradeAwareEntityMetadataAdapter;

  const workspaceIteratorService = {
    iterate: jest.fn(
      async ({
        workspaceIds: ids,
        callback,
      }: {
        workspaceIds: string[];
        dryRun: boolean;
        callback: (ctx: { workspaceId: string }) => Promise<void>;
      }) => {
        const successes: string[] = [];
        const failures: string[] = [];

        for (const workspaceId of ids) {
          try {
            await callback({ workspaceId });
            successes.push(workspaceId);
          } catch {
            failures.push(workspaceId);
          }
        }

        return { success: successes, fail: failures };
      },
    ),
  } as unknown as WorkspaceIteratorService;

  const workspaceVersionService = {
    getActiveOrSuspendedWorkspaceIds: jest.fn().mockResolvedValue(workspaceIds),
  } as unknown as WorkspaceVersionService;

  const runner = new UpgradeSequenceRunnerService(
    upgradeMigrationService,
    instanceCommandRunnerService,
    workspaceCommandRunnerService,
    upgradeSequenceReaderService,
    upgradeAwareEntityMetadataAdapter,
    workspaceIteratorService,
    workspaceVersionService,
  );

  return { runner, runFastInstanceCommandMock, runWorkspaceCommandsMock };
};

describe('UpgradeSequenceRunnerService', () => {
  describe('cursor-recovery edge case (issue #20699)', () => {
    // Scenario: a retroactive fix ships a new instance command with a timestamp
    // earlier than other commands in the same version (e.g. PR #20664 adding
    // AddRelationTargetFieldMetadataId to the 2.5 slot). The workspace step that
    // follows it previously failed. On resume, resolveStartCursor must NOT jump
    // straight to the workspace segment — it must first run the new instance
    // command that was inserted before it.
    it('should run a new instance command inserted before a failed workspace step on resume', async () => {
      // Sequence: [Ic-old (completed), Ic-new (NOT in DB), Wc (failed)]
      //
      // Ic-old ran before the fix shipped. Ic-new was added retroactively with
      // a lower timestamp. On startup, the last-attempted command is Wc/failed.
      // The runner must detect Ic-new as pending and start from there.
      const IC_OLD = 'Ic-old';
      const IC_NEW = 'Ic-new';
      const WC = 'Wc';

      const sequence: UpgradeStep[] = [
        makeFastInstanceStep(IC_OLD),
        makeFastInstanceStep(IC_NEW),
        makeWorkspaceStep(WC),
      ];

      const workspaceCursors = new Map([
        [
          'ws-1',
          {
            workspaceId: 'ws-1',
            name: WC,
            status: 'failed' as const,
            executedByVersion: '2.5.0',
            errorMessage: null,
            createdAt: new Date(),
            isInitial: false,
          },
        ],
      ]);

      const { runner, runFastInstanceCommandMock } = buildRunner({
        lastAttemptedCommand: { name: WC, status: 'failed' },
        // IC_OLD completed; IC_NEW was never run (not in DB)
        completedInstanceCommands: new Set([IC_OLD]),
        workspaceCursorsByWorkspaceId: workspaceCursors,
      });

      await runner.run({
        sequence,
        options: { dryRun: false },
      });

      // IC_NEW must have been invoked
      expect(runFastInstanceCommandMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: IC_NEW }),
      );
    });

    it('should not re-run already-completed instance commands before a failed workspace step', async () => {
      // When ALL instance commands before the workspace step are already
      // completed, the runner should resume at the workspace step directly
      // and must NOT call runFastInstanceCommand for them.
      const IC_OLD = 'Ic-old';
      const WC = 'Wc';

      const sequence: UpgradeStep[] = [
        makeFastInstanceStep(IC_OLD),
        makeWorkspaceStep(WC),
      ];

      const workspaceCursors = new Map([
        [
          'ws-1',
          {
            workspaceId: 'ws-1',
            name: WC,
            status: 'failed' as const,
            executedByVersion: '2.5.0',
            errorMessage: null,
            createdAt: new Date(),
            isInitial: false,
          },
        ],
      ]);

      const { runner, runFastInstanceCommandMock } = buildRunner({
        lastAttemptedCommand: { name: WC, status: 'failed' },
        completedInstanceCommands: new Set([IC_OLD]),
        workspaceCursorsByWorkspaceId: workspaceCursors,
      });

      await runner.run({
        sequence,
        options: { dryRun: false },
      });

      // IC_OLD is already completed — runner must not invoke it again
      expect(runFastInstanceCommandMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ name: IC_OLD }),
      );
    });
  });
});
