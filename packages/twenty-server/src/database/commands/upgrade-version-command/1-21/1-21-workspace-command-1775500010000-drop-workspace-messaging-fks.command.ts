import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const FK_COLUMNS_TO_DROP = [
  {
    tableName: 'messageChannelMessageAssociation',
    columnName: 'messageChannelId',
  },
  {
    tableName: 'calendarChannelEventAssociation',
    columnName: 'calendarChannelId',
  },
  { tableName: 'messageFolder', columnName: 'messageChannelId' },
  {
    tableName: 'messageChannelMessageAssociationMessageFolder',
    columnName: 'messageFolderId',
  },
];

@RegisteredWorkspaceCommand('1.21.0', 1775500010000)
@Command({
  name: 'upgrade:1-21:drop-workspace-messaging-fks',
  description:
    'Drop FK constraints from workspace messaging/calendar tables that now reference core schema entities',
})
export class DropWorkspaceMessagingFksCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!dataSource) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      for (const { tableName, columnName } of FK_COLUMNS_TO_DROP) {
        const foreignKeyName =
          await this.workspaceSchemaManagerService.foreignKeyManager.getForeignKeyName(
            {
              queryRunner,
              schemaName,
              tableName,
              columnName,
            },
          );

        if (!foreignKeyName) {
          continue;
        }

        if (options.dryRun) {
          this.logger.log(
            `[DRY RUN] Would drop FK ${foreignKeyName} from ${schemaName}.${tableName}`,
          );
          continue;
        }

        await this.workspaceSchemaManagerService.foreignKeyManager.dropForeignKey(
          {
            queryRunner,
            schemaName,
            tableName,
            foreignKeyName,
          },
        );

        this.logger.log(
          `Dropped FK ${foreignKeyName} from ${schemaName}.${tableName}`,
        );
      }
    } finally {
      await queryRunner.release();
    }
  }
}
