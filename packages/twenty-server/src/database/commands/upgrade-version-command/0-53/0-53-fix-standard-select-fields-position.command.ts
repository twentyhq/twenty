import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  CALENDAR_CHANNEL_STANDARD_FIELD_IDS,
  MESSAGE_CHANNEL_STANDARD_FIELD_IDS,
  TASK_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { CalendarChannelSyncStatus } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelSyncStatus } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Command({
  name: 'upgrade:0-53:fix-standard-select-fields-position',
  description: 'Fix standard select fields position',
})
export class FixStandardSelectFieldsPositionCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    if (!options.dryRun) {
      await this.overrideTaskStatusFieldMetadataPosition({ workspaceId });
      await this.overrideMessageChannelSyncStatusFieldMetadataPosition({
        workspaceId,
      });
      await this.overrideCalendarChannelSyncStatusFieldMetadataPosition({
        workspaceId,
      });

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );
    }
  }

  private async overrideTaskStatusFieldMetadataPosition({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const taskStatusFieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        workspaceId,
        standardId: TASK_STANDARD_FIELD_IDS.status,
      },
    });

    if (!taskStatusFieldMetadata) {
      throw new Error(
        `Task status field metadata not found for workspace ${workspaceId}`,
      );
    }

    const expectedPositionPerStatus: Record<string, number> = {
      TODO: 0,
      IN_PROGRESS: 1,
      DONE: 2,
    };

    await this.fieldMetadataRepository.update(
      {
        workspaceId,
        standardId: TASK_STANDARD_FIELD_IDS.status,
      },
      {
        options: taskStatusFieldMetadata.options.map(
          (option: FieldMetadataComplexOption) => {
            const expectedPosition = expectedPositionPerStatus[option.value];

            if (expectedPosition === undefined) {
              throw new Error(
                `Expected a position to be defined for the status: ${option.value}`,
              );
            }

            return {
              ...option,
              position: expectedPosition,
            };
          },
        ),
      },
    );
  }

  private async overrideMessageChannelSyncStatusFieldMetadataPosition({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const messageChannelSyncStatusFieldMetadata =
      await this.fieldMetadataRepository.findOne({
        where: {
          workspaceId,
          standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
        },
      });

    if (!messageChannelSyncStatusFieldMetadata) {
      throw new Error(
        `Message channel sync status field metadata not found for workspace ${workspaceId}`,
      );
    }

    const expectedPositionPerSyncStatus: Record<
      MessageChannelSyncStatus,
      number
    > = {
      [MessageChannelSyncStatus.ONGOING]: 0,
      [MessageChannelSyncStatus.NOT_SYNCED]: 1,
      [MessageChannelSyncStatus.ACTIVE]: 2,
      [MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS]: 3,
      [MessageChannelSyncStatus.FAILED_UNKNOWN]: 4,
    };

    await this.fieldMetadataRepository.update(
      {
        workspaceId,
        standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
      },
      {
        options: messageChannelSyncStatusFieldMetadata.options.map(
          (option: FieldMetadataComplexOption) => {
            const expectedPosition =
              expectedPositionPerSyncStatus[option.value];

            if (expectedPosition === undefined) {
              throw new Error(
                `Expected a position to be defined for the sync status: ${option.value}`,
              );
            }

            return {
              ...option,
              position: expectedPosition,
            };
          },
        ),
      },
    );
  }

  private async overrideCalendarChannelSyncStatusFieldMetadataPosition({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const calendarChannelSyncStatusFieldMetadata =
      await this.fieldMetadataRepository.findOne({
        where: {
          workspaceId,
          standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
        },
      });

    if (!calendarChannelSyncStatusFieldMetadata) {
      throw new Error(
        `Message channel sync status field metadata not found for workspace ${workspaceId}`,
      );
    }

    const expectedPositionPerSyncStatus: Record<
      CalendarChannelSyncStatus,
      number
    > = {
      [CalendarChannelSyncStatus.ONGOING]: 0,
      [CalendarChannelSyncStatus.NOT_SYNCED]: 1,
      [CalendarChannelSyncStatus.ACTIVE]: 2,
      [CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS]: 3,
      [CalendarChannelSyncStatus.FAILED_UNKNOWN]: 4,
    };

    await this.fieldMetadataRepository.update(
      {
        workspaceId,
        standardId: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
      },
      {
        options: calendarChannelSyncStatusFieldMetadata.options.map(
          (option: FieldMetadataComplexOption) => {
            const expectedPosition =
              expectedPositionPerSyncStatus[option.value];

            if (expectedPosition === undefined) {
              throw new Error(
                `Expected a position to be defined for the sync status: ${option.value}`,
              );
            }

            return {
              ...option,
              position: expectedPosition,
            };
          },
        ),
      },
    );
  }
}
