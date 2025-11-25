import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataServiceV2 } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service-v2';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
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
    private readonly fieldMetadataService: FieldMetadataServiceV2,
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
        `Would add CALENDAR_EVENTS_IMPORT_SCHEDULED sync stage for workspace ${workspaceId}`,
      );

      return;
    }

    await this.fieldMetadataService.updateOneField({
      updateFieldInput: {
        id: syncStageField.id,
        options: [
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
            position: 9,
            color: 'gray',
          },
        ],
      },
      workspaceId,
      isSystemBuild: true,
    });

    this.logger.log(
      `Successfully added CALENDAR_EVENTS_IMPORT_SCHEDULED sync stage for workspace ${workspaceId}`,
    );
  }
}
