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
import { MESSAGE_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MessageChannelSyncStage } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Command({
  name: 'upgrade:1-12:add-messages-import-scheduled-sync-stage',
  description:
    'Add MESSAGES_IMPORT_SCHEDULED sync stage to message channel syncStage field',
})
export class AddMessagesImportScheduledSyncStageCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
      `Adding MESSAGES_IMPORT_SCHEDULED sync stage for workspace ${workspaceId}`,
    );

    const messageChannelObject = await this.objectMetadataRepository.findOne({
      where: {
        standardId: STANDARD_OBJECT_IDS.messageChannel,
        workspaceId,
      },
    });

    if (!messageChannelObject) {
      this.logger.log(
        `MessageChannel object not found for workspace ${workspaceId}, skipping enum migration`,
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

    const hasMessagesImportScheduled = fieldOptions.some(
      (option) =>
        option.value === MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
    );

    if (hasMessagesImportScheduled) {
      this.logger.log(
        `MessageChannel syncStage field metadata already has MESSAGES_IMPORT_SCHEDULED for workspace ${workspaceId}`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would add MESSAGES_IMPORT_SCHEDULED sync stage for workspace ${workspaceId}`,
      );

      return;
    }

    await this.fieldMetadataService.updateOneField({
      updateFieldInput: {
        id: syncStageField.id,
        options: [
          {
            value: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
            label: 'Messages list fetch pending',
            position: 0,
            color: 'blue',
          },
          {
            value: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
            label: 'Messages list fetch scheduled',
            position: 1,
            color: 'green',
          },
          {
            value: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
            label: 'Messages list fetch ongoing',
            position: 2,
            color: 'orange',
          },
          {
            value: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
            label: 'Messages import pending',
            position: 3,
            color: 'blue',
          },
          {
            value: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
            label: 'Messages import scheduled',
            position: 4,
            color: 'green',
          },
          {
            value: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
            label: 'Messages import ongoing',
            position: 5,
            color: 'orange',
          },
          {
            value: MessageChannelSyncStage.FAILED,
            label: 'Failed',
            position: 6,
            color: 'red',
          },
          {
            value: MessageChannelSyncStage.PENDING_CONFIGURATION,
            label: 'Pending configuration',
            position: 7,
            color: 'gray',
          },
        ],
      },
      workspaceId,
      isSystemBuild: true,
    });

    this.logger.log(
      `Successfully added MESSAGES_IMPORT_SCHEDULED sync stage for workspace ${workspaceId}`,
    );
  }
}
