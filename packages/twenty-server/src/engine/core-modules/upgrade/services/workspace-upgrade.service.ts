import { Injectable, Logger } from '@nestjs/common';

import { type WorkspaceIteratorContext } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type UpgradeCommandOptions } from 'src/database/commands/upgrade-version-command/upgrade.command';
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
    workspaceCommands,
  }: RunWorkspaceCommandsArgs): Promise<void> {
    const { workspaceId, index, total } = iteratorContext;

    this.logger.log(
      `${options.dryRun ? '(dry run) ' : ''}Upgrading workspace ${workspaceId} ${index + 1}/${total}`,
    );

    const executedByVersion =
      this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    const cursors =
      await this.upgradeMigrationService.getWorkspaceCursorsOrThrow([
        workspaceId,
      ]);

    const lastCompletedName = cursors.get(workspaceId) as string;

    const pendingCommands = this.getPendingWorkspaceCommands(
      workspaceCommands,
      lastCompletedName,
      workspaceId,
    );

    for (const workspaceCommandEntry of pendingCommands) {
      await this.runSingleWorkspaceCommandOrThrow({
        workspaceCommandEntry,
        workspaceId,
        executedByVersion,
        options,
        iteratorContext,
      });
    }

    this.logger.log(`Upgrade for workspace ${workspaceId} completed.`);
  }

  private getPendingWorkspaceCommands(
    workspaceCommands: WorkspaceCommandEntry[],
    lastCompletedName: string,
    workspaceId: string,
  ): WorkspaceCommandEntry[] {
    const cursorIndex = workspaceCommands.findIndex(
      (command) => command.name === lastCompletedName,
    );

    if (cursorIndex === -1) {
      throw new Error(
        `Workspace ${workspaceId} cursor "${lastCompletedName}" not found ` +
          'in the current workspace segment',
      );
    }

    return workspaceCommands.slice(cursorIndex + 1);
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
