import { Injectable, Logger } from '@nestjs/common';

import {
  type WorkspaceIteratorReport,
  WorkspaceIteratorService,
} from 'src/database/commands/command-runners/workspace-iterator.service';
import { type UpgradeCommandOptions } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import {
  type InstanceUpgradeStep,
  type UpgradeStep,
  type WorkspaceUpgradeStep,
  UpgradeSequenceReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { assertUnreachable } from 'twenty-shared/utils';

export type UpgradeSequenceRunnerReport = {
  totalSuccesses: number;
  totalFailures: number;
};

@Injectable()
export class UpgradeSequenceRunnerService {
  private readonly logger = new Logger(UpgradeSequenceRunnerService.name);

  constructor(
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly instanceCommandRunnerService: InstanceCommandRunnerService,
    private readonly workspaceCommandRunnerService: WorkspaceCommandRunnerService,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    private readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {}

  async run({
    sequence,
    activeWorkspaceIds,
    options,
  }: {
    sequence: UpgradeStep[];
    activeWorkspaceIds: string[];
    options: UpgradeCommandOptions;
  }): Promise<UpgradeSequenceRunnerReport> {
    if (sequence.length === 0) {
      return { totalSuccesses: 0, totalFailures: 0 };
    }

    const hasNoWorkspaces = activeWorkspaceIds.length === 0;

    const startCursor = await this.resolveStartCursor(
      sequence,
      activeWorkspaceIds,
    );

    let totalSuccesses = 0;
    let totalFailures = 0;
    let cursor = startCursor;

    while (cursor < sequence.length) {
      const step = sequence[cursor];

      if (step.kind === 'fast-instance' || step.kind === 'slow-instance') {
        const previousStep = cursor > 0 ? sequence[cursor - 1] : undefined;
        if (previousStep?.kind === 'workspace') {
          await this.enforceWorkspaceSyncBarrier(
            previousStep.name,
            activeWorkspaceIds,
          );
        }

        await this.runInstanceStep(step, {
          skipDataMigration: hasNoWorkspaces,
        });
        cursor++;
        continue;
      }

      const contiguousWorkspaceSteps =
        this.upgradeSequenceReaderService.collectContiguousWorkspaceSteps({
          sequence,
          fromWorkspaceCommand: step,
        });

      const report = await this.resumeWorkspaceCommandsFromCursors({
        contiguousWorkspaceSteps,
        activeWorkspaceIds,
        options,
      });

      totalSuccesses += report.success.length;
      totalFailures += report.fail.length;

      if (report.fail.length > 0) {
        this.logger.error(
          `Workspace steps ended with ${report.fail.length} failure(s). ` +
            'Aborting — cannot proceed to next instance step.',
        );

        return { totalSuccesses, totalFailures };
      }

      cursor += contiguousWorkspaceSteps.length;
    }

    return { totalSuccesses, totalFailures };
  }

  private async resolveStartCursor(
    sequence: UpgradeStep[],
    activeWorkspaceIds: string[],
  ): Promise<number> {
    const lastAttempted =
      await this.upgradeMigrationService.getLastAttemptedCommandNameOrThrow();

    const lastAttemptedCursor =
      this.upgradeSequenceReaderService.locateStepInSequenceOrThrow({
        sequence,
        stepName: lastAttempted.name,
      });

    const lastAttemptedStep = sequence[lastAttemptedCursor];

    switch (lastAttemptedStep.kind) {
      case 'fast-instance':
      case 'slow-instance': {
        return lastAttempted.status === 'completed'
          ? lastAttemptedCursor + 1
          : lastAttemptedCursor;
      }
      case 'workspace': {
        const workspaceSliceBounds =
          this.upgradeSequenceReaderService.getWorkspaceCommandsSliceBounds({
            sequence,
            workspaceCommand: lastAttemptedStep,
          });

        await this.validateWorkspaceCursorsAreInSameWorkspaceStepsSlice(
          sequence,
          activeWorkspaceIds,
          workspaceSliceBounds,
        );

        return workspaceSliceBounds.startCursor;
      }
      default:
        assertUnreachable(lastAttemptedStep);
    }
  }

  private async validateWorkspaceCursorsAreInSameWorkspaceStepsSlice(
    sequence: UpgradeStep[],
    activeWorkspaceIds: string[],
    { endCursor, startCursor }: { startCursor: number; endCursor: number },
  ): Promise<void> {
    const workspaceCursors =
      await this.upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow(
        activeWorkspaceIds,
      );

    for (const [workspaceId, workspaceCursor] of workspaceCursors) {
      const cursor =
        this.upgradeSequenceReaderService.locateStepInSequenceOrThrow({
          sequence,
          stepName: workspaceCursor.name,
        });

      if (cursor < startCursor || cursor > endCursor) {
        throw new Error(
          `Workspace ${workspaceId} cursor "${workspaceCursor.name}" is outside the ` +
            `current workspace slice [${startCursor}..${endCursor}] — ` +
            'workspaces are not aligned',
        );
      }
    }
  }

  private async runInstanceStep(
    step: InstanceUpgradeStep,
    { skipDataMigration }: { skipDataMigration: boolean },
  ): Promise<void> {
    switch (step.kind) {
      case 'fast-instance': {
        const result =
          await this.instanceCommandRunnerService.runFastInstanceCommand({
            command: step.command,
            name: step.name,
          });

        if (result.status === 'failed') {
          throw result.error;
        }

        return;
      }
      case 'slow-instance': {
        const result =
          await this.instanceCommandRunnerService.runSlowInstanceCommand({
            command: step.command,
            name: step.name,
            skipDataMigration,
          });

        if (result.status === 'failed') {
          throw result.error;
        }

        return;
      }
      default:
        assertUnreachable(step);
    }
  }

  private async resumeWorkspaceCommandsFromCursors({
    contiguousWorkspaceSteps,
    activeWorkspaceIds,
    options,
  }: {
    contiguousWorkspaceSteps: WorkspaceUpgradeStep[];
    activeWorkspaceIds: string[];
    options: UpgradeCommandOptions;
  }): Promise<WorkspaceIteratorReport> {
    const workspaceCursors =
      await this.upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow(
        activeWorkspaceIds,
      );

    return this.workspaceIteratorService.iterate({
      workspaceIds:
        options.workspaceId && options.workspaceId.size > 0
          ? Array.from(options.workspaceId)
          : undefined,
      startFromWorkspaceId: options.startFromWorkspaceId,
      workspaceCountLimit: options.workspaceCountLimit,
      dryRun: options.dryRun,
      callback: async (context) => {
        const workspaceCursor = workspaceCursors.get(context.workspaceId);

        if (!workspaceCursor) {
          throw new Error(
            `No upgrade migration found for workspace ${context.workspaceId}. This should never occur.`,
          );
        }

        const pendingCommands =
          this.upgradeSequenceReaderService.getPendingWorkspaceCommands({
            workspaceCommands: contiguousWorkspaceSteps,
            workspaceCursor,
          });

        await this.workspaceCommandRunnerService.runWorkspaceCommands({
          iteratorContext: context,
          options,
          workspaceCommands: pendingCommands,
        });
      },
    });
  }

  private async enforceWorkspaceSyncBarrier(
    lastWorkspaceCommandName: string,
    activeWorkspaceIds: string[],
  ): Promise<void> {
    const allWorkspacesReady =
      await this.upgradeMigrationService.areAllWorkspacesAtCommand({
        commandName: lastWorkspaceCommandName,
        workspaceIds: activeWorkspaceIds,
      });

    if (!allWorkspacesReady) {
      throw new Error(
        'Cannot run instance step: not all workspaces have completed ' +
          `"${lastWorkspaceCommandName}"`,
      );
    }
  }
}
