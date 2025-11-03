import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Command({
  name: 'upgrade:1-10:migrate-channel-partial-full-sync-stages',
  description:
    'Migrate message and calendar channel partial and full sync stages',
})
export class MigrateChannelPartialFullSyncStagesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Migrating channel sync stages for workspace ${workspaceId}`,
    );

    const schemaName = getWorkspaceSchemaName(workspaceId);

    await this.migrateMessageChannelSyncStages(
      workspaceId,
      schemaName,
      options,
    );

    await this.migrateCalendarChannelSyncStages(
      workspaceId,
      schemaName,
      options,
    );

    this.logger.log(
      `Successfully migrated channel sync stages for workspace ${workspaceId}`,
    );
  }

  private async migrateMessageChannelSyncStages(
    workspaceId: string,
    schemaName: string,
    options: RunOnWorkspaceArgs['options'],
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messageChannelUpdateResult: any;

    const tableName = 'messageChannel';

    if (options.dryRun) {
      this.logger.log(
        `Would migrate deprecated messageChannel sync stages for workspace ${workspaceId}`,
      );

      return;
    }

    try {
      messageChannelUpdateResult = await this.coreDataSource.query(
        `UPDATE "${schemaName}"."${tableName}"
          SET "syncStage" = 'MESSAGE_LIST_FETCH_PENDING'
          WHERE "syncStage" IN ('FULL_MESSAGE_LIST_FETCH_PENDING', 'PARTIAL_MESSAGE_LIST_FETCH_PENDING')`,
      );
    } catch {
      this.logger.log(
        `Error (expected) while trying to migrate messageChannel sync stages for workspace ${workspaceId}, nothing to migrate`,
      );

      return;
    }

    const messageChannelRowsUpdated = messageChannelUpdateResult[1] || 0;

    this.logger.log(
      `Migrated ${messageChannelRowsUpdated} messageChannel records from deprecated sync stages in workspace ${workspaceId}`,
    );
  }

  private async migrateCalendarChannelSyncStages(
    workspaceId: string,
    schemaName: string,
    options: RunOnWorkspaceArgs['options'],
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let calendarChannelUpdateResult: any;

    const tableName = 'calendarChannel';

    if (options.dryRun) {
      this.logger.log(
        `Would migrate deprecated calendarChannel sync stages for workspace ${workspaceId}`,
      );

      return;
    }

    try {
      calendarChannelUpdateResult = await this.coreDataSource.query(
        `UPDATE "${schemaName}"."${tableName}"
        SET "syncStage" = 'CALENDAR_EVENT_LIST_FETCH_PENDING'
        WHERE "syncStage" IN ('FULL_CALENDAR_EVENT_LIST_FETCH_PENDING', 'PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING')`,
      );
    } catch {
      this.logger.log(
        `Error (expected) while trying to migrate calendarChannel sync stages for workspace ${workspaceId}, nothing to migrate`,
      );

      return;
    }

    const calendarChannelRowsUpdated = calendarChannelUpdateResult[1] || 0;

    this.logger.log(
      `Migrated ${calendarChannelRowsUpdated} calendarChannel records from deprecated sync stages in workspace ${workspaceId}`,
    );
  }
}
