import { Injectable, Logger } from '@nestjs/common';

import { type WorkspaceIteratorContext } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type UpgradeCommandOptions } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { type UpgradeCommandVersion } from 'src/engine/constants/upgrade-command-supported-versions.constant';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';

type WorkspaceCommandEntry = Pick<
  RegisteredWorkspaceCommand,
  'name' | 'command'
>;

export type RunWorkspaceCommandsArgs = {
  iteratorContext: WorkspaceIteratorContext;
  options: UpgradeCommandOptions;
  version: UpgradeCommandVersion;
  workspaceCommands: WorkspaceCommandEntry[];
};

@Injectable()
export class WorkspaceUpgradeService {
  private readonly logger = new Logger(WorkspaceUpgradeService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
  ) {}

  async runWorkspaceCommands({
    iteratorContext,
    options,
    version,
    workspaceCommands,
  }: RunWorkspaceCommandsArgs): Promise<void> {
    const { workspaceId, index, total } = iteratorContext;

    this.logger.log(
      `${options.dryRun ? '(dry run) ' : ''}Upgrading workspace ${workspaceId} [${version}] ${index + 1}/${total}`,
    );

    const executedByVersion =
      this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    const completedNames =
      await this.upgradeMigrationService.getCompletedCommandNames(workspaceId);

    for (const workspaceCommandEntry of workspaceCommands) {
      if (completedNames.has(workspaceCommandEntry.name)) {
        this.logger.log(
          `Workspace command ${workspaceCommandEntry.name} already completed for workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      await this.runSingleWorkspaceCommandOrThrow({
        workspaceCommandEntry,
        workspaceId,
        executedByVersion,
        options,
        iteratorContext,
      });
    }

    this.logger.log(
      `Upgrade for workspace ${workspaceId} [${version}] completed.`,
    );
  }

  private async runSingleWorkspaceCommandOrThrow({
    workspaceCommandEntry,
    workspaceId,
    executedByVersion,
    options,
    iteratorContext,
  }: {
    workspaceCommandEntry: WorkspaceCommandEntry;
    workspaceId: string;
    executedByVersion: string;
    options: UpgradeCommandOptions;
    iteratorContext: WorkspaceIteratorContext;
  }): Promise<void> {
    const { name, command: workspaceCommand } = workspaceCommandEntry;

    try {
      await workspaceCommand.runOnWorkspace({
        options,
        workspaceId,
        dataSource: iteratorContext.dataSource,
        index: iteratorContext.index,
        total: iteratorContext.total,
      });

      if (!options.dryRun) {
        await this.upgradeMigrationService.markAsCompleted({
          name,
          workspaceId,
          executedByVersion,
        });
      }
    } catch (error) {
      if (!options.dryRun) {
        await this.upgradeMigrationService.markAsFailed({
          name,
          workspaceId,
          executedByVersion,
          error,
        });
      }

      throw error;
    }
  }
}
