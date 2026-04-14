import { Injectable, Logger } from '@nestjs/common';

import {
  type WorkspaceIteratorReport,
  WorkspaceIteratorService,
} from 'src/database/commands/command-runners/workspace-iterator.service';
import { type ParsedUpgradeCommandOptions } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import {
  type WorkspaceCursor,
  UpgradeMigrationService,
} from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import {
  type InstanceUpgradeStep,
  type UpgradeStep,
  type WorkspaceUpgradeStep,
  UpgradeSequenceReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

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
    private readonly workspaceVersionService: WorkspaceVersionService,
  ) {}

  async run({
    sequence,
    options,
  }: {
    sequence: UpgradeStep[];
    options: ParsedUpgradeCommandOptions;
  }): Promise<UpgradeSequenceRunnerReport> {
    if (sequence.length === 0) {
      return { totalSuccesses: 0, totalFailures: 0 };
    }

    const allActiveOrSuspendedWorkspaceIds =
      await this.workspaceVersionService.getActiveOrSuspendedWorkspaceIds();

    const startCursor = await this.resolveStartCursor({
      sequence,
      allActiveOrSuspendedWorkspaceIds,
    });

    let totalSuccesses = 0;
    let totalFailures = 0;
    let cursor = startCursor;
    let workspaceCursors = await this.fetchWorkspaceCursors(
      allActiveOrSuspendedWorkspaceIds,
    );

    while (cursor < sequence.length) {
      const step = sequence[cursor];

      if (step.kind === 'fast-instance' || step.kind === 'slow-instance') {
        const previousStep = cursor > 0 ? sequence[cursor - 1] : undefined;

        if (previousStep?.kind === 'workspace') {
          this.enforceWorkspacesCompletedPreviousWorkspaceSegment({
            sequence,
            previousWorkspaceStep: previousStep,
            workspaceCursors,
          });
        }

        await this.runInstanceStep({
          instanceStep: step,
          skipDataMigration: allActiveOrSuspendedWorkspaceIds.length === 0,
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
        workspaceCursors,
        allActiveOrSuspendedWorkspaceIds,
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

      workspaceCursors = await this.fetchWorkspaceCursors(
        allActiveOrSuspendedWorkspaceIds,
      );
    }

    return { totalSuccesses, totalFailures };
  }

  private async resolveStartCursor({
    sequence,
    allActiveOrSuspendedWorkspaceIds,
  }: {
    sequence: UpgradeStep[];
    allActiveOrSuspendedWorkspaceIds: string[];
  }): Promise<number> {
    const lastAttempted =
      await this.upgradeMigrationService.getLastAttemptedCommandNameOrThrow(
        allActiveOrSuspendedWorkspaceIds,
      );

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

        await this.validateWorkspaceCursorsAreInSameSegmentOrAhead({
          sequence,
          allActiveOrSuspendedWorkspaceIds,
          workspaceSliceBounds,
        });

        return workspaceSliceBounds.startCursor;
      }
      default:
        assertUnreachable(lastAttemptedStep);
    }
  }

  private async validateWorkspaceCursorsAreInSameSegmentOrAhead({
    allActiveOrSuspendedWorkspaceIds,
    sequence,
    workspaceSliceBounds: { startCursor, endCursor },
  }: {
    sequence: UpgradeStep[];
    allActiveOrSuspendedWorkspaceIds: string[];
    workspaceSliceBounds: { startCursor: number; endCursor: number };
  }): Promise<void> {
    const workspaceCursors =
      await this.upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow(
        allActiveOrSuspendedWorkspaceIds,
      );

    for (const [workspaceId, workspaceCursor] of workspaceCursors) {
      const cursor =
        this.upgradeSequenceReaderService.locateStepInSequenceOrThrow({
          sequence,
          stepName: workspaceCursor.name,
        });

      if (cursor >= startCursor && cursor <= endCursor) {
        continue;
      }

      if (cursor > endCursor && workspaceCursor.isInitial) {
        continue;
      }

      throw new Error(
        `Workspace ${workspaceId} cursor "${workspaceCursor.name}" is outside the ` +
          `current workspace slice [${startCursor}..${endCursor}] — ` +
          'workspaces are not aligned',
      );
    }
  }

  private async fetchWorkspaceCursors(
    allActiveOrSuspendedWorkspaceIds: string[],
  ): Promise<Map<string, WorkspaceCursor>> {
    return this.upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow(
      allActiveOrSuspendedWorkspaceIds,
    );
  }

  private async runInstanceStep({
    instanceStep,
    skipDataMigration,
  }: {
    instanceStep: InstanceUpgradeStep;
    skipDataMigration: boolean;
  }): Promise<void> {
    switch (instanceStep.kind) {
      case 'fast-instance': {
        const result =
          await this.instanceCommandRunnerService.runFastInstanceCommand({
            command: instanceStep.command,
            name: instanceStep.name,
          });

        if (result.status === 'failed') {
          throw result.error;
        }

        return;
      }
      case 'slow-instance': {
        const result =
          await this.instanceCommandRunnerService.runSlowInstanceCommand({
            command: instanceStep.command,
            name: instanceStep.name,
            skipDataMigration,
          });

        if (result.status === 'failed') {
          throw result.error;
        }

        return;
      }
      default:
        assertUnreachable(instanceStep);
    }
  }

  private async resumeWorkspaceCommandsFromCursors({
    contiguousWorkspaceSteps,
    workspaceCursors,
    allActiveOrSuspendedWorkspaceIds,
    options,
  }: {
    contiguousWorkspaceSteps: WorkspaceUpgradeStep[];
    workspaceCursors: Map<string, WorkspaceCursor>;
    allActiveOrSuspendedWorkspaceIds: string[];
    options: ParsedUpgradeCommandOptions;
  }): Promise<WorkspaceIteratorReport> {
    const segmentStepNames = new Set(
      contiguousWorkspaceSteps.map((step) => step.name),
    );

    const workspaceIdsForSegment = this.filterWorkspaceIdsForSegment({
      allActiveOrSuspendedWorkspaceIds,
      workspaceCursors,
      segmentStepNames,
      options,
    });

    return this.workspaceIteratorService.iterate({
      workspaceIds: workspaceIdsForSegment,
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

  private filterWorkspaceIdsForSegment({
    allActiveOrSuspendedWorkspaceIds,
    workspaceCursors,
    segmentStepNames,
    options,
  }: {
    allActiveOrSuspendedWorkspaceIds: string[];
    workspaceCursors: Map<string, WorkspaceCursor>;
    segmentStepNames: Set<string>;
    options: ParsedUpgradeCommandOptions;
  }): string[] {
    const candidateIds =
      isDefined(options.workspaceIds) && options.workspaceIds.length > 0
        ? options.workspaceIds
        : allActiveOrSuspendedWorkspaceIds;

    return candidateIds.filter((workspaceId) => {
      const cursor = workspaceCursors.get(workspaceId);

      if (!cursor) {
        throw new Error(
          `No upgrade migration cursor found for workspace ${workspaceId}. This should never occur.`,
        );
      }

      if (cursor.isInitial && !segmentStepNames.has(cursor.name)) {
        return false;
      }

      return true;
    });
  }

  private enforceWorkspacesCompletedPreviousWorkspaceSegment({
    sequence,
    previousWorkspaceStep,
    workspaceCursors,
  }: {
    sequence: UpgradeStep[];
    previousWorkspaceStep: WorkspaceUpgradeStep;
    workspaceCursors: Map<string, WorkspaceCursor>;
  }): void {
    const barrierCursor =
      this.upgradeSequenceReaderService.locateStepInSequenceOrThrow({
        sequence,
        stepName: previousWorkspaceStep.name,
      });

    for (const [workspaceId, workspaceCursor] of workspaceCursors) {
      const cursorPosition =
        this.upgradeSequenceReaderService.locateStepInSequenceOrThrow({
          sequence,
          stepName: workspaceCursor.name,
        });

      const isAtBarrierAndCompleted =
        cursorPosition === barrierCursor &&
        workspaceCursor.status === 'completed';

      const isBeyondBarrierWithInitialCursor =
        cursorPosition > barrierCursor && workspaceCursor.isInitial;

      const isAtOrBeyondBarrier =
        isAtBarrierAndCompleted || isBeyondBarrierWithInitialCursor;

      if (!isAtOrBeyondBarrier) {
        throw new Error(
          `Cannot run instance step: workspace ${workspaceId} ` +
            `has not completed "${previousWorkspaceStep.name}" ` +
            `(cursor: "${workspaceCursor.name}", status: "${workspaceCursor.status}")`,
        );
      }
    }
  }
}
