import { Injectable, Logger } from '@nestjs/common';

import { CommandShutdownService } from 'src/database/commands/command-runners/command-shutdown.service';
import {
  type WorkspaceIteratorReport,
  WorkspaceIteratorService,
} from 'src/database/commands/command-runners/workspace-iterator.service';
import { type ParsedUpgradeCommandOptions } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import {
  UpgradeMigrationService,
  WorkspaceLastAttemptedCommand,
} from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import {
  type InstanceUpgradeStep,
  type UpgradeStep,
  type WorkspaceUpgradeStep,
  UpgradeSequenceReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { formatUpgradeLog } from 'src/engine/core-modules/upgrade/utils/format-upgrade-log.util';
import { isUpgradeWorkspaceCursorValidForSegment } from 'src/engine/core-modules/upgrade/utils/is-upgrade-workspace-cursor-valid-for-segment.util';
import { UpgradeAwareEntityMetadataAdapter } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-entity-metadata.adapter';
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
    private readonly upgradeAwareEntityMetadataAdapter: UpgradeAwareEntityMetadataAdapter,
    private readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceVersionService: WorkspaceVersionService,
    private readonly commandShutdownService: CommandShutdownService,
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

    await this.upgradeAwareEntityMetadataAdapter.refresh();

    try {
      return await this.runInner({ sequence, options });
    } finally {
      try {
        await this.upgradeAwareEntityMetadataAdapter.refresh();
      } catch (refreshError) {
        this.logger.error(
          `Failed to refresh upgrade-aware entity metadata after run`,
          refreshError instanceof Error
            ? refreshError.stack
            : String(refreshError),
        );
      }
    }
  }

  private async runInner({
    sequence,
    options,
  }: {
    sequence: UpgradeStep[];
    options: ParsedUpgradeCommandOptions;
  }): Promise<UpgradeSequenceRunnerReport> {
    const allProvisionedWorkspaceIds =
      await this.workspaceVersionService.getProvisionedWorkspaceIds();

    const startCursor = await this.resolveStartCursor({
      sequence,
      allProvisionedWorkspaceIds,
    });

    let totalSuccesses = 0;
    let totalFailures = 0;
    let cursor = startCursor;
    let workspaceCursors = await this.fetchWorkspaceCursors(
      allProvisionedWorkspaceIds,
    );

    while (cursor < sequence.length) {
      const step = sequence[cursor];

      if (this.commandShutdownService.isShutdownRequested()) {
        this.logger.warn(
          formatUpgradeLog({
            humanMessage:
              `Stopping before step "${step.name}": shutdown requested. ` +
              'Rerun the upgrade to resume from this step.',
            event: 'sequence.stopped',
            logFields: {
              before: step.name,
              reason: 'shutdown-requested',
            },
          }),
        );

        break;
      }

      if (step.kind === 'fast-instance' || step.kind === 'slow-instance') {
        if (
          (isDefined(options.workspaceIds) &&
            options.workspaceIds.length > 0) ||
          isDefined(options.startFromWorkspaceId) ||
          isDefined(options.workspaceCountLimit)
        ) {
          this.logger.log(
            formatUpgradeLog({
              humanMessage:
                `Stopping before instance step "${step.name}": ` +
                'upgrade was run with a workspace filter (-w, --start-from-workspace-id, or --workspace-count-limit). ' +
                'Instance commands require all workspaces to be aligned.',
              event: 'sequence.stopped',
              logFields: {
                before: step.name,
                reason: 'workspace-filter-active',
              },
            }),
          );

          break;
        }

        const previousStep = cursor > 0 ? sequence[cursor - 1] : undefined;

        if (previousStep?.kind === 'workspace') {
          const workspaceCursorBehindBarrier =
            this.findWorkspaceCursorBehindWorkspaceStep({
              sequence,
              workspaceStep: previousStep,
              workspaceCursors,
            });

          const hasSimulatedPreviousWorkspaceSegment =
            options.dryRun === true && cursor !== startCursor;

          if (
            isDefined(workspaceCursorBehindBarrier) &&
            hasSimulatedPreviousWorkspaceSegment
          ) {
            this.logger.log(
              formatUpgradeLog({
                humanMessage:
                  `Dry run stopped before instance step "${step.name}": ` +
                  `it runs only once every workspace has completed "${previousStep.name}", ` +
                  'and a dry run does not record workspace progress. ' +
                  'A dry run cannot simulate past this point.',
                event: 'sequence.stopped',
                logFields: {
                  before: step.name,
                  reason: 'dry-run',
                },
              }),
            );

            break;
          }

          if (isDefined(workspaceCursorBehindBarrier)) {
            throw new Error(
              `Cannot run instance step: workspace ${workspaceCursorBehindBarrier.workspaceId} ` +
                `has not completed "${previousStep.name}" ` +
                `(cursor: "${workspaceCursorBehindBarrier.name}", status: "${workspaceCursorBehindBarrier.status}")`,
            );
          }
        }

        if (options.dryRun) {
          this.logger.log(
            formatUpgradeLog({
              humanMessage: `Dry run: would run ${step.kind} step "${step.name}"`,
              event: 'instance.skipped',
              logFields: {
                name: step.name,
                kind: step.kind,
                reason: 'dry-run',
              },
            }),
          );

          cursor++;
          continue;
        }

        await this.runInstanceStep({
          instanceStep: step,
          skipDataMigration: allProvisionedWorkspaceIds.length === 0,
        });

        await this.upgradeAwareEntityMetadataAdapter.refresh();

        cursor++;
        continue;
      }

      const workspaceCommandsSegment =
        this.upgradeSequenceReaderService.collectWorkspaceCommandsStartingFrom({
          sequence,
          fromWorkspaceCommand: step,
        });

      const report = await this.resumeWorkspaceCommandsFromCursors({
        workspaceCommandsSegment,
        workspaceCursors,
        allProvisionedWorkspaceIds,
        options,
      });

      totalSuccesses += report.success.length;
      totalFailures += report.fail.length;

      if (report.fail.length > 0) {
        this.logger.error(
          formatUpgradeLog({
            humanMessage:
              `Workspace steps ended with ${report.fail.length} failure(s). ` +
              'Aborting — cannot proceed to next instance step.',
            event: 'sequence.aborted',
            logFields: {
              failures: report.fail.length,
              reason: 'workspace-failures',
            },
          }),
        );

        return { totalSuccesses, totalFailures };
      }

      if (report.interrupted) {
        this.logger.warn(
          formatUpgradeLog({
            humanMessage:
              'Stopped during workspace steps: shutdown requested. ' +
              'Rerun the upgrade to process the remaining workspaces.',
            event: 'sequence.stopped',
            logFields: {
              reason: 'shutdown-requested',
              processedWorkspaces: report.success.length,
            },
          }),
        );

        return { totalSuccesses, totalFailures };
      }

      cursor += workspaceCommandsSegment.length;

      workspaceCursors = await this.fetchWorkspaceCursors(
        allProvisionedWorkspaceIds,
      );
    }

    return { totalSuccesses, totalFailures };
  }

  private async resolveStartCursor({
    sequence,
    allProvisionedWorkspaceIds,
  }: {
    sequence: UpgradeStep[];
    allProvisionedWorkspaceIds: string[];
  }): Promise<number> {
    const lastAttempted =
      await this.upgradeMigrationService.getLastAttemptedCommandNameOrThrow(
        allProvisionedWorkspaceIds,
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
          this.upgradeSequenceReaderService.getWorkspaceSegmentBounds({
            sequence,
            workspaceCommand: lastAttemptedStep,
          });

        await this.validateWorkspaceCursorsAreInWorkspaceSegment({
          sequence,
          allProvisionedWorkspaceIds,
          workspaceSliceBounds,
        });

        return workspaceSliceBounds.startCursor;
      }
      default:
        assertUnreachable(lastAttemptedStep);
    }
  }

  private async validateWorkspaceCursorsAreInWorkspaceSegment({
    allProvisionedWorkspaceIds,
    sequence,
    workspaceSliceBounds: { startCursor, endCursor },
  }: {
    sequence: UpgradeStep[];
    allProvisionedWorkspaceIds: string[];
    workspaceSliceBounds: { startCursor: number; endCursor: number };
  }): Promise<void> {
    const workspaceCursors =
      await this.upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow(
        allProvisionedWorkspaceIds,
      );
    const invalidWorkspaces: Array<{
      workspaceId: string;
      cursorName: string;
      cursorStatus: string;
    }> = [];

    for (const [workspaceId, workspaceCursor] of workspaceCursors) {
      const cursorPosition =
        this.upgradeSequenceReaderService.locateStepInSequenceOrThrow({
          sequence,
          stepName: workspaceCursor.name,
        });

      const isWorkspaceCursorValid = isUpgradeWorkspaceCursorValidForSegment({
        sequence,
        cursorPosition,
        workspaceCursorStatus: workspaceCursor.status,
        startCursor,
        endCursor,
      });

      if (!isWorkspaceCursorValid) {
        invalidWorkspaces.push({
          workspaceId,
          cursorName: workspaceCursor.name,
          cursorStatus: workspaceCursor.status,
        });
      }
    }

    if (invalidWorkspaces.length > 0) {
      const details = invalidWorkspaces
        .map(
          ({ workspaceId, cursorName, cursorStatus }) =>
            `${workspaceId} at "${cursorName}" (${cursorStatus})`,
        )
        .join(', ');

      throw new Error(
        `${invalidWorkspaces.length} workspace(s) have invalid cursors for ` +
          `workspace segment [${startCursor}..${endCursor}]: ${details}`,
      );
    }
  }

  private async fetchWorkspaceCursors(
    allProvisionedWorkspaceIds: string[],
  ): Promise<Map<string, WorkspaceLastAttemptedCommand>> {
    return this.upgradeMigrationService.getWorkspaceLastAttemptedCommandNameOrThrow(
      allProvisionedWorkspaceIds,
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
    workspaceCommandsSegment,
    workspaceCursors,
    allProvisionedWorkspaceIds,
    options,
  }: {
    workspaceCommandsSegment: WorkspaceUpgradeStep[];
    workspaceCursors: Map<string, WorkspaceLastAttemptedCommand>;
    allProvisionedWorkspaceIds: string[];
    options: ParsedUpgradeCommandOptions;
  }): Promise<WorkspaceIteratorReport> {
    const workspaceIds = this.deriveWorkspaceIdsToProcess({
      allProvisionedWorkspaceIds,
      options,
    });

    return this.workspaceIteratorService.iterate({
      workspaceIds,
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
            workspaceCommands: workspaceCommandsSegment,
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

  private deriveWorkspaceIdsToProcess({
    allProvisionedWorkspaceIds,
    options,
  }: {
    allProvisionedWorkspaceIds: string[];
    options: ParsedUpgradeCommandOptions;
  }): string[] {
    if (isDefined(options.workspaceIds) && options.workspaceIds.length > 0) {
      return options.workspaceIds;
    }

    let workspaceIds = allProvisionedWorkspaceIds;

    if (isDefined(options.startFromWorkspaceId)) {
      workspaceIds = workspaceIds.filter(
        (id) => id >= options.startFromWorkspaceId!,
      );
    }

    if (isDefined(options.workspaceCountLimit)) {
      workspaceIds = workspaceIds.slice(0, options.workspaceCountLimit);
    }

    return workspaceIds;
  }

  private findWorkspaceCursorBehindWorkspaceStep({
    sequence,
    workspaceStep,
    workspaceCursors,
  }: {
    sequence: UpgradeStep[];
    workspaceStep: WorkspaceUpgradeStep;
    workspaceCursors: Map<string, WorkspaceLastAttemptedCommand>;
  }): WorkspaceLastAttemptedCommand | undefined {
    const barrierCursor =
      this.upgradeSequenceReaderService.locateStepInSequenceOrThrow({
        sequence,
        stepName: workspaceStep.name,
      });

    for (const workspaceCursor of workspaceCursors.values()) {
      const cursorPosition =
        this.upgradeSequenceReaderService.locateStepInSequenceOrThrow({
          sequence,
          stepName: workspaceCursor.name,
        });

      const isAtBarrierAndCompleted =
        cursorPosition === barrierCursor &&
        workspaceCursor.status === 'completed';

      if (!isAtBarrierAndCompleted) {
        return workspaceCursor;
      }
    }

    return undefined;
  }
}
