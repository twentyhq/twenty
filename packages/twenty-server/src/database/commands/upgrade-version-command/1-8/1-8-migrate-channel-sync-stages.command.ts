import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  CALENDAR_CHANNEL_STANDARD_FIELD_IDS,
  MESSAGE_CHANNEL_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CalendarChannelSyncStage } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelSyncStage } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Command({
  name: 'upgrade:1-8:migrate-channel-sync-stages',
  description:
    'Migrate message and calendar channel sync stages: add PENDING_CONFIGURATION, add MESSAGE_LIST_FETCH_SCHEDULED, migrate deprecated stages',
})
export class MigrateChannelSyncStagesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    await this.updateMessageChannelSyncStageFieldMetadata(workspaceId);

    await this.updateCalendarChannelSyncStageFieldMetadata(workspaceId);

    const schemaName = getWorkspaceSchemaName(workspaceId);

    this.logger.log(
      `Migrating channel sync stages for workspace ${workspaceId} in schema ${schemaName}`,
    );

    const messageChannelTableExists = await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${schemaName}'
        AND table_name = 'messageChannel'
      );
    `);

    if (messageChannelTableExists[0]?.exists) {
      // Step 1: Add new enum values for MessageChannelSyncStage
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."messageChannel_syncStage_enum" ADD VALUE 'PENDING_CONFIGURATION'`,
        );
        this.logger.log(
          `Added PENDING_CONFIGURATION to messageChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      } catch {
        this.logger.log(
          `PENDING_CONFIGURATION already exists in messageChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      }

      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."messageChannel_syncStage_enum" ADD VALUE 'MESSAGE_LIST_FETCH_SCHEDULED'`,
        );
        this.logger.log(
          `Added MESSAGE_LIST_FETCH_SCHEDULED to messageChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      } catch {
        this.logger.log(
          `MESSAGE_LIST_FETCH_SCHEDULED already exists in messageChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      }

      // Step 2: Migrate deprecated MessageChannel sync stages
      try {
        const messageChannelUpdateResult = await this.coreDataSource.query(
          `UPDATE "${schemaName}"."messageChannel"
           SET "syncStage" = 'MESSAGE_LIST_FETCH_PENDING'
           WHERE "syncStage" IN ('FULL_MESSAGE_LIST_FETCH_PENDING', 'PARTIAL_MESSAGE_LIST_FETCH_PENDING')`,
        );

        const messageChannelRowsUpdated = messageChannelUpdateResult[1] || 0;

        this.logger.log(
          `Migrated ${messageChannelRowsUpdated} messageChannel records from deprecated sync stages in workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to migrate messageChannel sync stages for workspace ${workspaceId}: ${error.message}`,
        );
        throw error;
      }
    } else {
      this.logger.log(
        `messageChannel table does not exist in workspace ${workspaceId}, skipping`,
      );
    }

    const calendarChannelTableExists = await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${schemaName}'
        AND table_name = 'calendarChannel'
      );
    `);

    if (calendarChannelTableExists[0]?.exists) {
      // Step 3: Add new enum values for CalendarChannelSyncStage
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."calendarChannel_syncStage_enum" ADD VALUE 'PENDING_CONFIGURATION'`,
        );
        this.logger.log(
          `Added PENDING_CONFIGURATION to calendarChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      } catch {
        this.logger.log(
          `PENDING_CONFIGURATION already exists in calendarChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      }

      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."calendarChannel_syncStage_enum" ADD VALUE 'CALENDAR_EVENT_LIST_FETCH_SCHEDULED'`,
        );
        this.logger.log(
          `Added CALENDAR_EVENT_LIST_FETCH_SCHEDULED to calendarChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      } catch {
        this.logger.log(
          `CALENDAR_EVENT_LIST_FETCH_SCHEDULED already exists in calendarChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      }

      // Step 4: Migrate deprecated CalendarChannel sync stages
      try {
        const calendarChannelUpdateResult = await this.coreDataSource.query(
          `UPDATE "${schemaName}"."calendarChannel"
           SET "syncStage" = 'CALENDAR_EVENT_LIST_FETCH_PENDING'
           WHERE "syncStage" IN ('FULL_CALENDAR_EVENT_LIST_FETCH_PENDING', 'PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING')`,
        );

        const calendarChannelRowsUpdated = calendarChannelUpdateResult[1] || 0;

        this.logger.log(
          `Migrated ${calendarChannelRowsUpdated} calendarChannel records from deprecated sync stages in workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to migrate calendarChannel sync stages for workspace ${workspaceId}: ${error.message}`,
        );
        throw error;
      }
    } else {
      this.logger.log(
        `calendarChannel table does not exist in workspace ${workspaceId}, skipping`,
      );
    }

    this.logger.log(
      `Successfully migrated channel sync stages for workspace ${workspaceId}`,
    );
  }

  private async updateMessageChannelSyncStageFieldMetadata(
    workspaceId: string,
  ): Promise<void> {
    const messageChannelObject = await this.objectMetadataRepository.findOne({
      where: {
        standardId: STANDARD_OBJECT_IDS.messageChannel,
        workspaceId,
      },
    });

    if (!messageChannelObject) {
      this.logger.log(
        `MessageChannel object not found for workspace ${workspaceId}, skipping field metadata update`,
      );

      return;
    }

    const syncStageField = await this.fieldMetadataRepository.findOne({
      where: {
        standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStage,
        objectMetadataId: messageChannelObject.id,
        workspaceId,
      },
    });

    if (!syncStageField) {
      this.logger.log(
        `MessageChannel syncStage field not found for workspace ${workspaceId}, skipping field metadata update`,
      );

      return;
    }

    const options = syncStageField.options || [];

    const hasMessageListFetchScheduled = options.some(
      (option) =>
        option.value === MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
    );

    const hasPendingConfiguration = options.some(
      (option) =>
        option.value === MessageChannelSyncStage.PENDING_CONFIGURATION,
    );

    if (hasMessageListFetchScheduled && hasPendingConfiguration) {
      this.logger.log(
        `MessageChannel syncStage field metadata already migrated for workspace ${workspaceId}`,
      );

      return;
    }

    if (!hasMessageListFetchScheduled) {
      const insertIndex =
        options.findIndex(
          (opt) =>
            opt.value === MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
        ) + 1;

      options.splice(insertIndex, 0, {
        value: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
        label: 'Messages list fetch scheduled',
        position: insertIndex,
      });
    }

    if (!hasPendingConfiguration) {
      options.push({
        value: MessageChannelSyncStage.PENDING_CONFIGURATION,
        label: 'Pending configuration',
        position: options.length,
      });
    }

    options.forEach((option, index) => {
      option.position = index;
    });

    syncStageField.options = options;

    await this.fieldMetadataRepository.save(syncStageField);

    this.logger.log(
      `Updated MessageChannel syncStage field metadata for workspace ${workspaceId}`,
    );
  }

  private async updateCalendarChannelSyncStageFieldMetadata(
    workspaceId: string,
  ): Promise<void> {
    const calendarChannelObject = await this.objectMetadataRepository.findOne({
      where: {
        standardId: STANDARD_OBJECT_IDS.calendarChannel,
        workspaceId,
      },
    });

    if (!calendarChannelObject) {
      this.logger.log(
        `CalendarChannel object not found for workspace ${workspaceId}, skipping field metadata update`,
      );

      return;
    }

    const syncStageField = await this.fieldMetadataRepository.findOne({
      where: {
        standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStage,
        objectMetadataId: calendarChannelObject.id,
        workspaceId,
      },
    });

    if (!syncStageField) {
      this.logger.log(
        `CalendarChannel syncStage field not found for workspace ${workspaceId}, skipping field metadata update`,
      );

      return;
    }

    const options = syncStageField.options || [];

    const hasCalendarEventListFetchScheduled = options.some(
      (option) =>
        option.value ===
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
    );

    const hasPendingConfiguration = options.some(
      (option) =>
        option.value === CalendarChannelSyncStage.PENDING_CONFIGURATION,
    );

    if (hasCalendarEventListFetchScheduled && hasPendingConfiguration) {
      this.logger.log(
        `CalendarChannel syncStage field metadata already migrated for workspace ${workspaceId}`,
      );

      return;
    }

    if (!hasCalendarEventListFetchScheduled) {
      const insertIndex =
        options.findIndex(
          (opt) =>
            opt.value ===
            CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        ) + 1;

      options.splice(insertIndex, 0, {
        value: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
        label: 'Calendar event list fetch scheduled',
        position: insertIndex,
      });
    }

    if (!hasPendingConfiguration) {
      options.push({
        value: CalendarChannelSyncStage.PENDING_CONFIGURATION,
        label: 'Pending configuration',
        position: options.length,
      });
    }

    options.forEach((option, index) => {
      option.position = index;
    });

    syncStageField.options = options;

    await this.fieldMetadataRepository.save(syncStageField);

    this.logger.log(
      `Updated CalendarChannel syncStage field metadata for workspace ${workspaceId}`,
    );
  }
}
