import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { CALENDAR_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { CalendarChannelSyncStage } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

@Command({
  name: 'upgrade:1-12:add-calendar-events-import-scheduled-sync-stage',
  description:
    'Add CALENDAR_EVENTS_IMPORT_SCHEDULED sync stage to calendar channel syncStage field',
})
export class AddCalendarEventsImportScheduledSyncStageCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
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
      `Adding CALENDAR_EVENTS_IMPORT_SCHEDULED sync stage for workspace ${workspaceId}`,
    );

    await this.updateCalendarChannelSyncStageFieldMetadata(
      workspaceId,
      options,
    );

    await this.addCalendarEventsImportScheduledEnumValue(workspaceId, options);

    this.logger.log(
      `Successfully added CALENDAR_EVENTS_IMPORT_SCHEDULED sync stage for workspace ${workspaceId}`,
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

    if (options.dryRun) {
      this.logger.log(
        `Would try to add CALENDAR_EVENTS_IMPORT_SCHEDULED to calendarChannel_syncStage_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."calendarChannel_syncStage_enum" ADD VALUE IF NOT EXISTS 'CALENDAR_EVENTS_IMPORT_SCHEDULED'`,
        );
        this.logger.log(
          `Added CALENDAR_EVENTS_IMPORT_SCHEDULED to calendarChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding CALENDAR_EVENTS_IMPORT_SCHEDULED to calendarChannel_syncStage_enum for workspace ${workspaceId}: ${error}`,
        );
      }
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

    const fieldOptions = (syncStageField.options ||
      []) as FieldMetadataComplexOption[];

    const hasCalendarEventsImportScheduled = fieldOptions.some(
      (option) =>
        option.value ===
        CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED,
    );

    if (hasCalendarEventsImportScheduled) {
      this.logger.log(
        `CalendarChannel syncStage field metadata already has CALENDAR_EVENTS_IMPORT_SCHEDULED for workspace ${workspaceId}`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would add CALENDAR_EVENTS_IMPORT_SCHEDULED to CalendarChannel syncStage field metadata for workspace ${workspaceId}`,
      );

      return;
    }

    fieldOptions.push({
      value: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED,
      label: 'Calendar events import scheduled',
      position: 4,
      color: 'green',
    });

    syncStageField.options = fieldOptions;

    await this.fieldMetadataRepository.save(syncStageField);

    this.logger.log(
      `Added CALENDAR_EVENTS_IMPORT_SCHEDULED to CalendarChannel syncStage field metadata for workspace ${workspaceId}`,
    );
  }
}

