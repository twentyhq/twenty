import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { DataSource, Repository } from 'typeorm';

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
      `Adding MESSAGES_IMPORT_SCHEDULED sync stage for workspace ${workspaceId}`,
    );

    await this.updateMessageChannelSyncStageFieldMetadata(workspaceId, options);

    await this.addMessagesImportScheduledEnumValue(workspaceId, options);

    this.logger.log(
      `Successfully added MESSAGES_IMPORT_SCHEDULED sync stage for workspace ${workspaceId}`,
    );
  }

  private async addMessagesImportScheduledEnumValue(
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
        `MessageChannel object not found for workspace ${workspaceId}, skipping enum migration`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    if (options.dryRun) {
      this.logger.log(
        `Would try to add MESSAGES_IMPORT_SCHEDULED to messageChannel_syncStage_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."messageChannel_syncStage_enum" ADD VALUE IF NOT EXISTS 'MESSAGES_IMPORT_SCHEDULED'`,
        );
        this.logger.log(
          `Added MESSAGES_IMPORT_SCHEDULED to messageChannel_syncStage_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding MESSAGES_IMPORT_SCHEDULED to messageChannel_syncStage_enum for workspace ${workspaceId}: ${error}`,
        );
      }
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
        `Would add MESSAGES_IMPORT_SCHEDULED to MessageChannel syncStage field metadata for workspace ${workspaceId}`,
      );

      return;
    }

    fieldOptions.push({
      value: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
      label: 'Messages import scheduled',
      position: 4,
      color: 'green',
    });

    syncStageField.options = fieldOptions;

    await this.fieldMetadataRepository.save(syncStageField);

    this.logger.log(
      `Added MESSAGES_IMPORT_SCHEDULED to MessageChannel syncStage field metadata for workspace ${workspaceId}`,
    );
  }
}
