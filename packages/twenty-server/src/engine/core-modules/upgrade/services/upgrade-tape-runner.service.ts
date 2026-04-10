import { Injectable, Logger } from '@nestjs/common';

import {
  type WorkspaceIteratorReport,
  type WorkspaceIteratorService,
} from 'src/database/commands/command-runners/workspace-iterator.service';
import { type UpgradeCommandOptions } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import {
  type InstanceSegment,
  type TapeSegment,
  type WorkspaceSegment,
  UpgradeTapeReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-tape-reader.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';

export type UpgradeTapeRunnerReport = {
  totalSuccesses: number;
  totalFailures: number;
};

@Injectable()
export class UpgradeTapeRunnerService {
  private readonly logger = new Logger(UpgradeTapeRunnerService.name);

  constructor(
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly instanceUpgradeService: InstanceUpgradeService,
    private readonly workspaceUpgradeService: WorkspaceUpgradeService,
    private readonly upgradeTapeReaderService: UpgradeTapeReaderService,
  ) {}

  async run({
    tape,
    activeWorkspaceIds,
    options,
    workspaceIteratorService,
  }: {
    tape: TapeSegment[];
    activeWorkspaceIds: string[];
    options: UpgradeCommandOptions;
    workspaceIteratorService: WorkspaceIteratorService;
  }): Promise<UpgradeTapeRunnerReport> {
    if (tape.length === 0) {
      return { totalSuccesses: 0, totalFailures: 0 };
    }

    const hasWorkspaces = activeWorkspaceIds.length > 0;

    const startSegmentIndex = await this.resolveStartSegmentIndex(
      tape,
      activeWorkspaceIds,
    );

    let totalSuccesses = 0;
    let totalFailures = 0;
    let previousWorkspaceSegment: WorkspaceSegment | undefined;

    for (
      let segmentIndex = startSegmentIndex;
      segmentIndex < tape.length;
      segmentIndex++
    ) {
      const segment = tape[segmentIndex];

      if (segment.kind === 'instance') {
        if (hasWorkspaces && previousWorkspaceSegment) {
          await this.enforceWorkspaceSyncBarrier(
            previousWorkspaceSegment,
            activeWorkspaceIds,
          );
        }

        await this.runInstanceSegment({
          segment,
          hasWorkspaces,
        });
      }

      if (segment.kind === 'workspace') {
        previousWorkspaceSegment = segment;

        if (!hasWorkspaces) {
          this.logger.log('No active workspaces, skipping workspace segment');
          continue;
        }

        const report = await this.runWorkspaceSegment({
          segment,
          options,
          workspaceIteratorService,
        });

        totalSuccesses += report.success.length;
        totalFailures += report.fail.length;

        if (report.fail.length > 0) {
          this.logger.error(
            `Workspace segment ended with ${report.fail.length} failure(s). ` +
              'Aborting — cannot proceed to next instance segment.',
          );

          return { totalSuccesses, totalFailures };
        }
      }
    }

    return { totalSuccesses, totalFailures };
  }

  private async resolveStartSegmentIndex(
    tape: TapeSegment[],
    activeWorkspaceIds: string[],
  ): Promise<number> {
    const lastCompletedName =
      await this.upgradeMigrationService.getLastCompletedCommandNameOrThrow();

    const cursor = this.upgradeTapeReaderService.locateCommandInTape(
      tape,
      lastCompletedName,
    );

    if (!cursor) {
      throw new Error(
        `Cursor "${lastCompletedName}" not found in upgrade tape — ` +
          'the supported version sequence may have been broken',
      );
    }

    if (cursor.kind === 'instance') {
      return cursor.segmentIndex;
    }

    // Cursor is a workspace command — validate all workspaces are
    // within the same segment before resuming from it.
    if (activeWorkspaceIds.length > 0) {
      await this.validateWorkspaceCursorsAlignment(
        tape,
        activeWorkspaceIds,
        cursor.segmentIndex,
      );
    }

    return cursor.segmentIndex;
  }

  private async validateWorkspaceCursorsAlignment(
    tape: TapeSegment[],
    activeWorkspaceIds: string[],
    expectedSegmentIndex: number,
  ): Promise<void> {
    const workspaceCursors =
      await this.upgradeMigrationService.getWorkspaceCursorsOrThrow(
        activeWorkspaceIds,
      );

    for (const [workspaceId, cursorName] of workspaceCursors) {
      const location = this.upgradeTapeReaderService.locateCommandInTape(
        tape,
        cursorName,
      );

      if (!location) {
        throw new Error(
          `Workspace ${workspaceId} cursor "${cursorName}" not found in upgrade tape`,
        );
      }

      if (location.kind !== 'workspace') {
        throw new Error(
          `Workspace ${workspaceId} cursor "${cursorName}" points to an instance command`,
        );
      }

      if (location.segmentIndex !== expectedSegmentIndex) {
        throw new Error(
          `Workspace ${workspaceId} cursor is in segment ${location.segmentIndex} ` +
            `but expected segment ${expectedSegmentIndex} — workspaces are not aligned`,
        );
      }
    }
  }

  private async runInstanceSegment({
    segment,
    hasWorkspaces,
  }: {
    segment: InstanceSegment;
    hasWorkspaces: boolean;
  }): Promise<void> {
    for (const step of segment.fastInstanceSteps) {
      const result = await this.instanceUpgradeService.runFastInstanceCommand({
        command: step.command,
        name: step.name,
      });

      if (result.status === 'failed') {
        throw result.error;
      }
    }

    for (const step of segment.slowInstanceSteps) {
      const result = await this.instanceUpgradeService.runSlowInstanceCommand({
        command: step.command,
        name: step.name,
        skipDataMigration: !hasWorkspaces,
      });

      if (result.status === 'failed') {
        throw result.error;
      }
    }
  }

  private async runWorkspaceSegment({
    segment,
    options,
    workspaceIteratorService,
  }: {
    segment: WorkspaceSegment;
    options: UpgradeCommandOptions;
    workspaceIteratorService: WorkspaceIteratorService;
  }): Promise<WorkspaceIteratorReport> {
    return workspaceIteratorService.iterate({
      workspaceIds:
        options.workspaceId && options.workspaceId.size > 0
          ? Array.from(options.workspaceId)
          : undefined,
      startFromWorkspaceId: options.startFromWorkspaceId,
      workspaceCountLimit: options.workspaceCountLimit,
      dryRun: options.dryRun,
      callback: async (context) => {
        await this.workspaceUpgradeService.runWorkspaceCommands({
          iteratorContext: context,
          options,
          workspaceCommands: segment.steps,
        });
      },
    });
  }

  private async enforceWorkspaceSyncBarrier(
    previousWorkspaceSegment: WorkspaceSegment,
    activeWorkspaceIds: string[],
  ): Promise<void> {
    const lastWorkspaceCommand =
      previousWorkspaceSegment.steps[previousWorkspaceSegment.steps.length - 1];

    const allWorkspacesReady =
      await this.upgradeMigrationService.areAllWorkspacesAtCommand({
        commandName: lastWorkspaceCommand.name,
        workspaceIds: activeWorkspaceIds,
      });

    if (!allWorkspacesReady) {
      throw new Error(
        `Cannot run instance segment: not all workspaces have completed ` +
          `${lastWorkspaceCommand.name} [${lastWorkspaceCommand.version}]`,
      );
    }
  }
}
