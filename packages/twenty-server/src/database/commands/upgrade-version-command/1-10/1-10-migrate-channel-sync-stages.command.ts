import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  CALENDAR_CHANNEL_STANDARD_FIELD_IDS,
  MESSAGE_CHANNEL_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CalendarChannelSyncStage } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelSyncStage } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Command({
  name: 'upgrade:1-10:migrate-channel-sync-stages',
  description:
    'Migrate message and calendar channel sync stages: add PENDING_CONFIGURATION, add MESSAGE_LIST_FETCH_SCHEDULED, migrate deprecated stages',
})
export class MigrateChannelSyncStagesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
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

    await this.updateMessageChannelSyncStageFieldMetadata(workspaceId, options);

    await this.updateCalendarChannelSyncStageFieldMetadata(
      workspaceId,
      options,
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
    const messageChannelObject = await this.objectMetadataRepository.findOne({
      where: {
        standardId: STANDARD_OBJECT_IDS.messageChannel,
        workspaceId,
      },
    });

    if (!messageChannelObject) {
      this.logger.log(
        `MessageChannel object not found for workspace ${workspaceId}, skipping schema migration`,
      );

      return;
    }

    const tableName = computeObjectTargetTable(messageChannelObject);

    const tableExists = await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${schemaName}'
        AND table_name = '${tableName}'
      );
    `);

    if (!tableExists[0]?.exists) {
      this.logger.log(
        `Table ${schemaName}.${tableName} does not exist in workspace ${workspaceId}, skipping schema migration`,
      );

      return;
    }

    // Add new enum values for MessageChannelSyncStage
    if (options.dryRun) {
      this.logger.log(
        `Would try to add PENDING_CONFIGURATION to messageChannel_syncStage_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."messageChannel_syncStage_enum" ADD VALUE IF NOT EXISTS 'PENDING_CONFIGURATION'`,
        );
        this.logger.log(
          `Added PENDING_CONFIGURATION to messageChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding PENDING_CONFIGURATION to messageChannel_syncStage_enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }

    if (options.dryRun) {
      this.logger.log(
        `Would try to add MESSAGE_LIST_FETCH_SCHEDULED to messageChannel_syncStage_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."messageChannel_syncStage_enum" ADD VALUE IF NOT EXISTS 'MESSAGE_LIST_FETCH_SCHEDULED'`,
        );
        this.logger.log(
          `Added MESSAGE_LIST_FETCH_SCHEDULED to messageChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding MESSAGE_LIST_FETCH_SCHEDULED to messageChannel_syncStage_enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }

    // Migrate deprecated MessageChannel sync stages
    if (options.dryRun) {
      this.logger.log(
        `Would migrate deprecated messageChannel sync stages for workspace ${workspaceId}`,
      );
    } else {
      const messageChannelUpdateResult = await this.coreDataSource.query(
        `UPDATE "${schemaName}"."${tableName}"
         SET "syncStage" = 'MESSAGE_LIST_FETCH_PENDING'
         WHERE "syncStage" IN ('FULL_MESSAGE_LIST_FETCH_PENDING', 'PARTIAL_MESSAGE_LIST_FETCH_PENDING')`,
      );

      const messageChannelRowsUpdated = messageChannelUpdateResult[1] || 0;

      this.logger.log(
        `Migrated ${messageChannelRowsUpdated} messageChannel records from deprecated sync stages in workspace ${workspaceId}`,
      );
    }
  }

  private async migrateCalendarChannelSyncStages(
    workspaceId: string,
    schemaName: string,
    options: RunOnWorkspaceArgs['options'],
  ): Promise<void> {
    const calendarChannelObject = await this.objectMetadataRepository.findOne({
      where: {
        standardId: STANDARD_OBJECT_IDS.calendarChannel,
        workspaceId,
      },
    });

    if (!calendarChannelObject) {
      this.logger.log(
        `CalendarChannel object not found for workspace ${workspaceId}, skipping schema migration`,
      );

      return;
    }

    const tableName = computeObjectTargetTable(calendarChannelObject);

    const tableExists = await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${schemaName}'
        AND table_name = '${tableName}'
      );
    `);

    if (!tableExists[0]?.exists) {
      this.logger.log(
        `Table ${schemaName}.${tableName} does not exist in workspace ${workspaceId}, skipping schema migration`,
      );

      return;
    }

    // Add new enum values for CalendarChannelSyncStage
    if (options.dryRun) {
      this.logger.log(
        `Would try to add PENDING_CONFIGURATION to calendarChannel_syncStage_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."calendarChannel_syncStage_enum" ADD VALUE IF NOT EXISTS 'PENDING_CONFIGURATION'`,
        );
        this.logger.log(
          `Added PENDING_CONFIGURATION to calendarChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding PENDING_CONFIGURATION to calendarChannel_syncStage_enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }

    if (options.dryRun) {
      this.logger.log(
        `Would try to add CALENDAR_EVENT_LIST_FETCH_SCHEDULED to calendarChannel_syncStage_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."calendarChannel_syncStage_enum" ADD VALUE IF NOT EXISTS 'CALENDAR_EVENT_LIST_FETCH_SCHEDULED'`,
        );
        this.logger.log(
          `Added CALENDAR_EVENT_LIST_FETCH_SCHEDULED to calendarChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding CALENDAR_EVENT_LIST_FETCH_SCHEDULED to calendarChannel_syncStage_enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }

    // Migrate deprecated CalendarChannel sync stages
    if (options.dryRun) {
      this.logger.log(
        `Would migrate deprecated calendarChannel sync stages for workspace ${workspaceId}`,
      );
    } else {
      const calendarChannelUpdateResult = await this.coreDataSource.query(
        `UPDATE "${schemaName}"."${tableName}"
         SET "syncStage" = 'CALENDAR_EVENT_LIST_FETCH_PENDING'
         WHERE "syncStage" IN ('FULL_CALENDAR_EVENT_LIST_FETCH_PENDING', 'PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING')`,
      );

      const calendarChannelRowsUpdated = calendarChannelUpdateResult[1] || 0;

      this.logger.log(
        `Migrated ${calendarChannelRowsUpdated} calendarChannel records from deprecated sync stages in workspace ${workspaceId}`,
      );
    }
  }

  private async updateMessageChannelSyncStageFieldMetadata(
    workspaceId: string,
    options: RunOnWorkspaceArgs['options'],
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

    const fieldOptions = (syncStageField.options ||
      []) as FieldMetadataComplexOption[];

    const hasMessageListFetchScheduled = fieldOptions.some(
      (option) =>
        option.value === MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
    );

    const hasPendingConfiguration = fieldOptions.some(
      (option) =>
        option.value === MessageChannelSyncStage.PENDING_CONFIGURATION,
    );

    if (hasMessageListFetchScheduled && hasPendingConfiguration) {
      this.logger.log(
        `MessageChannel syncStage field metadata already migrated for workspace ${workspaceId}`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would update MessageChannel syncStage field metadata for workspace ${workspaceId}`,
      );

      return;
    }

    if (!hasMessageListFetchScheduled) {
      fieldOptions.push({
        value: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
        label: 'Messages list fetch scheduled',
        position: 1,
        color: 'green',
      });
    }

    if (!hasPendingConfiguration) {
      fieldOptions.push({
        value: MessageChannelSyncStage.PENDING_CONFIGURATION,
        label: 'Pending configuration',
        position: 9,
        color: 'gray',
      });
    }

    syncStageField.options = fieldOptions;

    await this.fieldMetadataRepository.save(syncStageField);

    this.logger.log(
      `Updated MessageChannel syncStage field metadata for workspace ${workspaceId}`,
    );
  }

  private async updateCalendarChannelSyncStageFieldMetadata(
    workspaceId: string,
    options: RunOnWorkspaceArgs['options'],
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

    const fieldOptions = (syncStageField.options ||
      []) as FieldMetadataComplexOption[];

    const hasCalendarEventListFetchScheduled = fieldOptions.some(
      (option) =>
        option.value ===
        CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
    );

    const hasPendingConfiguration = fieldOptions.some(
      (option) =>
        option.value === CalendarChannelSyncStage.PENDING_CONFIGURATION,
    );

    if (hasCalendarEventListFetchScheduled && hasPendingConfiguration) {
      this.logger.log(
        `CalendarChannel syncStage field metadata already migrated for workspace ${workspaceId}`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would update CalendarChannel syncStage field metadata for workspace ${workspaceId}`,
      );

      return;
    }

    if (!hasCalendarEventListFetchScheduled) {
      fieldOptions.push({
        value: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
        label: 'Calendar event list fetch scheduled',
        position: 1,
        color: 'green',
      });
    }

    if (!hasPendingConfiguration) {
      fieldOptions.push({
        value: CalendarChannelSyncStage.PENDING_CONFIGURATION,
        label: 'Pending configuration',
        position: 9,
        color: 'gray',
      });
    }

    syncStageField.options = fieldOptions;

    await this.fieldMetadataRepository.save(syncStageField);

    this.logger.log(
      `Updated CalendarChannel syncStage field metadata for workspace ${workspaceId}`,
    );
  }
}
