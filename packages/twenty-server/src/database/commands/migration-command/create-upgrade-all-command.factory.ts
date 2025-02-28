import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { MigrationCommandInterface } from 'src/database/commands/migration-command/interfaces/migration-command.interface';

import { MaintainedWorkspacesMigrationCommandRunner } from 'src/database/commands/migration-command/maintained-workspaces-migration-command.runner';
import { MIGRATION_COMMAND_INJECTION_TOKEN } from 'src/database/commands/migration-command/migration-command.constants';
import { MigrationCommandRunner } from 'src/database/commands/migration-command/migration-command.runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceLoggerService } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/services/sync-workspace-logger.service';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

export function createUpgradeAllCommand(
  version: string,
): new (...args: unknown[]) => MigrationCommandRunner {
  @Command({
    name: `upgrade-${version}`,
    description: `Upgrade to version ${version}`,
  })
  class UpgradeCommand extends MaintainedWorkspacesMigrationCommandRunner {
    constructor(
      @InjectRepository(Workspace, 'core')
      protected readonly workspaceRepository: Repository<Workspace>,
      protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
      @Inject(MIGRATION_COMMAND_INJECTION_TOKEN)
      private readonly subCommands: MigrationCommandInterface[],
      private readonly dataSourceService: DataSourceService,
      private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
      private readonly syncWorkspaceLoggerService: SyncWorkspaceLoggerService,
    ) {
      super(workspaceRepository, twentyORMGlobalManager);
    }

    // TODO Remove and avoid duplicated synchronize logic with SyncWorkspaceMetadataCommand after command refactoring
    private async synchronizeWorkspaceMetadata({
      workspaceIds,
      options,
    }: {
      workspaceIds: string[];
      options: Record<string, unknown>;
    }) {
      this.logger.log(`Attempting to sync ${workspaceIds.length} workspaces.`);
      const errorsDuringSync: string[] = [];

      for (const [index, workspaceId] of workspaceIds.entries()) {
        try {
          this.logger.log(
            `Running workspace sync for workspace: ${workspaceId} (${index + 1} out of ${workspaceIds.length})`,
          );
          const dataSourceMetadata =
            await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
              workspaceId,
            );

          const { storage, workspaceMigrations } =
            await this.workspaceSyncMetadataService.synchronize(
              {
                workspaceId,
                dataSourceId: dataSourceMetadata.id,
              },
              { applyChanges: !options.dryRun },
            );

          if (options.dryRun) {
            await this.syncWorkspaceLoggerService.saveLogs(
              workspaceId,
              storage,
              workspaceMigrations,
            );
          }
        } catch (error) {
          const errorMessage = `Failed to synchronize workspace ${workspaceId}: ${error.message}`;

          this.logger.error(errorMessage);
          errorsDuringSync.push(errorMessage);

          continue;
        }
      }
      this.logger.log(
        `Finished synchronizing all active workspaces (${
          workspaceIds.length
        } workspaces). ${
          errorsDuringSync.length > 0
            ? 'Errors during sync:\n' + errorsDuringSync.join('.\n')
            : ''
        }`,
      );
    }

    async runMigrationCommandOnMaintainedWorkspaces(
      passedParams: string[],
      options: Record<string, unknown>,
      workspaceIds: string[],
    ): Promise<void> {
      this.logger.log(`Running upgrade command for version ${version}`);

      for (const command of this.subCommands) {
        await command.runMigrationCommand(passedParams, options);
      }

      await this.synchronizeWorkspaceMetadata({ options, workspaceIds });

      this.logger.log(`Upgrade ${version} command completed!`);
    }
  }

  return UpgradeCommand;
}
