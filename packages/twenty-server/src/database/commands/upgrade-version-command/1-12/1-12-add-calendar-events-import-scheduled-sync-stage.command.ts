import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { CALENDAR_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { CalendarChannelSyncStage } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

@Command({
  name: 'upgrade:1-12:add-calendar-events-import-scheduled-sync-stage',
  description:
    'Replace calendar channel syncStage enum with complete CalendarChannelSyncStage values and update default to PENDING_CONFIGURATION',
})
export class AddCalendarEventsImportScheduledSyncStageCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Updating calendar channel syncStage enum and default value for workspace ${workspaceId}`,
    );

    await this.updateCalendarChannelSyncStageFieldMetadata(
      workspaceId,
      options,
    );

    await this.addCalendarEventsImportScheduledEnumValue(workspaceId, options);

    this.logger.log(
      `Successfully updated calendar channel syncStage enum and default value for workspace ${workspaceId}`,
    );
  }

  private async addCalendarEventsImportScheduledEnumValue(
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
        `CalendarChannel object not found for workspace ${workspaceId}, skipping enum migration`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableName = 'calendarChannel';
    const columnName = 'syncStage';
    const enumName = 'calendarChannel_syncStage_enum';

    if (options.dryRun) {
      this.logger.log(
        `Would replace ${enumName} with complete CalendarChannelSyncStage enum values for workspace ${workspaceId}`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Remove default value first
      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."${tableName}" ALTER COLUMN "${columnName}" DROP DEFAULT`,
      );

      // Convert column to text to remove enum dependency
      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."${tableName}" ALTER COLUMN "${columnName}" TYPE text USING "${columnName}"::text`,
      );

      // Drop the old enum (now safe since no column uses it)
      await queryRunner.query(
        `DROP TYPE IF EXISTS ${schemaName}."${enumName}" CASCADE`,
      );

      // Create new enum with all CalendarChannelSyncStage values
      await queryRunner.query(
        `CREATE TYPE ${schemaName}."${enumName}" AS ENUM (
          '${CalendarChannelSyncStage.PENDING_CONFIGURATION}',
          '${CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING}',
          '${CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED}',
          '${CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING}',
          '${CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING}',
          '${CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED}',
          '${CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING}',
          '${CalendarChannelSyncStage.FAILED}'
        )`,
      );

      // Convert column back to enum type
      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."${tableName}"
         ALTER COLUMN "${columnName}" TYPE ${schemaName}."${enumName}"
         USING "${columnName}"::${schemaName}."${enumName}"`,
      );

      // Update default value to PENDING_CONFIGURATION
      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."${tableName}"
         ALTER COLUMN "${columnName}" SET DEFAULT '${CalendarChannelSyncStage.PENDING_CONFIGURATION}'::${schemaName}."${enumName}"`,
      );

      await queryRunner.commitTransaction();

      this.logger.log(
        `Successfully replaced ${enumName} with complete CalendarChannelSyncStage enum values and updated default to PENDING_CONFIGURATION for workspace ${workspaceId}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `Error replacing ${enumName} for workspace ${workspaceId}: ${error}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
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

    if (options.dryRun) {
      this.logger.log(
        `Would add CALENDAR_EVENTS_IMPORT_SCHEDULED to CalendarChannel syncStage field metadata for workspace ${workspaceId}`,
      );

      return;
    }

    const syncStageFieldOptions = [
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        label: 'Calendar event list fetch pending',
        position: 0,
        color: 'blue',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
        label: 'Calendar event list fetch scheduled',
        position: 1,
        color: 'green',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
        label: 'Calendar event list fetch ongoing',
        position: 2,
        color: 'orange',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
        label: 'Calendar events import pending',
        position: 3,
        color: 'blue',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED,
        label: 'Calendar events import scheduled',
        position: 4,
        color: 'green',
      },
      {
        value: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
        label: 'Calendar events import ongoing',
        position: 5,
        color: 'orange',
      },
      {
        value: CalendarChannelSyncStage.FAILED,
        label: 'Failed',
        position: 6,
        color: 'red',
      },
      {
        value: CalendarChannelSyncStage.PENDING_CONFIGURATION,
        label: 'Pending configuration',
        position: 7,
        color: 'gray',
      },
    ];

    syncStageField.options = syncStageFieldOptions;
    syncStageField.defaultValue = `'${CalendarChannelSyncStage.PENDING_CONFIGURATION}'`;

    await this.fieldMetadataRepository.save(syncStageField);

    this.logger.log(
      `Added CALENDAR_EVENTS_IMPORT_SCHEDULED to CalendarChannel syncStage field metadata for workspace ${workspaceId}`,
    );
  }
}
