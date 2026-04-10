import { Injectable, Logger } from '@nestjs/common';

import {
  type WorkspaceIteratorService,
  type WorkspaceIteratorReport,
} from 'src/database/commands/command-runners/workspace-iterator.service';
import { type UpgradeCommandOptions } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import {
  type InstanceSegment,
  type TapeSegment,
  type WorkspaceSegment,
} from 'src/engine/core-modules/upgrade/services/upgrade-tape-reader.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
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
    const instanceCompletedNames =
      await this.upgradeMigrationService.getCompletedCommandNames(null);

    const hasWorkspaces = activeWorkspaceIds.length > 0;

    let totalSuccesses = 0;
    let totalFailures = 0;
    let previousWorkspaceSegment: WorkspaceSegment | undefined;

    for (const segment of tape) {
      if (segment.kind === 'instance') {
        if (hasWorkspaces && previousWorkspaceSegment) {
          await this.enforceWorkspaceSyncBarrier(
            previousWorkspaceSegment,
            activeWorkspaceIds,
          );
        }

        await this.runInstanceSegment({
          segment,
          instanceCompletedNames,
          hasWorkspaces,
        });
      }

      if (segment.kind === 'workspace') {
        previousWorkspaceSegment = segment;

        if (!hasWorkspaces) {
          this.logger.log(
            'No active workspaces, skipping workspace segment',
          );
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

  private async runInstanceSegment({
    segment,
    instanceCompletedNames,
    hasWorkspaces,
  }: {
    segment: InstanceSegment;
    instanceCompletedNames: Set<string>;
    hasWorkspaces: boolean;
  }): Promise<void> {
    const pendingFastSteps = segment.fastInstanceSteps.filter(
      (step) => !instanceCompletedNames.has(step.name),
    );

    const pendingSlowSteps = segment.slowInstanceSteps.filter(
      (step) => !instanceCompletedNames.has(step.name),
    );

    if (pendingFastSteps.length === 0 && pendingSlowSteps.length === 0) {
      return;
    }

    for (const step of pendingFastSteps) {
      const result =
        await this.instanceUpgradeService.runFastInstanceCommand({
          command: step.command,
          name: step.name,
        });

      if (result.status === 'failed') {
        throw result.error;
      }
    }

    for (const step of pendingSlowSteps) {
      const result =
        await this.instanceUpgradeService.runSlowInstanceCommand({
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
      previousWorkspaceSegment.steps[
        previousWorkspaceSegment.steps.length - 1
      ];

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
