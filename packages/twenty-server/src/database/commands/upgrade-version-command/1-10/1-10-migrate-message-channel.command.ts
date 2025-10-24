import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
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
import {
  MESSAGE_CHANNEL_STANDARD_FIELD_IDS,
  MESSAGE_FOLDER_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { MessageChannelPendingGroupEmailsAction } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

@Command({
  name: 'upgrade:1-10:migrate-message-channel',
  description:
    'Migrate message channel and message folder pending action enums: add pendingGroupEmailsAction and pendingSyncAction',
})
export class MigrateMessageChannelCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
    this.logger.log(`Migrating pending actions for workspace ${workspaceId}`);

    await this.updateMessageChannelPendingGroupEmailsActionFieldMetadata(
      workspaceId,
      options,
    );

    await this.updateMessageFolderPendingSyncActionFieldMetadata(
      workspaceId,
      options,
    );

    const schemaName = getWorkspaceSchemaName(workspaceId);

    await this.migrateMessageChannelPendingGroupEmailsAction(
      workspaceId,
      schemaName,
      options,
    );

    await this.migrateMessageFolderPendingSyncAction(
      workspaceId,
      schemaName,
      options,
    );

    this.logger.log(
      `Successfully migrated pending actions for workspace ${workspaceId}`,
    );
  }

  private async migrateMessageChannelPendingGroupEmailsAction(
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

    // Add new enum values for MessageChannelPendingGroupEmailsAction
    if (options.dryRun) {
      this.logger.log(
        `Would try to add GROUP_EMAILS_DELETION to messageChannel_pendingGroupEmailsAction_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."messageChannel_pendingGroupEmailsAction_enum" ADD VALUE IF NOT EXISTS 'GROUP_EMAILS_DELETION'`,
        );
        this.logger.log(
          `Added GROUP_EMAILS_DELETION to messageChannel_pendingGroupEmailsAction_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding GROUP_EMAILS_DELETION to messageChannel_pendingGroupEmailsAction_enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }

    if (options.dryRun) {
      this.logger.log(
        `Would try to add GROUP_EMAILS_IMPORT to messageChannel_pendingGroupEmailsAction_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."messageChannel_pendingGroupEmailsAction_enum" ADD VALUE IF NOT EXISTS 'GROUP_EMAILS_IMPORT'`,
        );
        this.logger.log(
          `Added GROUP_EMAILS_IMPORT to messageChannel_pendingGroupEmailsAction_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding GROUP_EMAILS_IMPORT to messageChannel_pendingGroupEmailsAction_enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }

    if (options.dryRun) {
      this.logger.log(
        `Would try to add NONE to messageChannel_pendingGroupEmailsAction_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."messageChannel_pendingGroupEmailsAction_enum" ADD VALUE IF NOT EXISTS 'NONE'`,
        );
        this.logger.log(
          `Added NONE to messageChannel_pendingGroupEmailsAction_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding NONE to messageChannel_pendingGroupEmailsAction_enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }
  }

  private async migrateMessageFolderPendingSyncAction(
    workspaceId: string,
    schemaName: string,
    options: RunOnWorkspaceArgs['options'],
  ): Promise<void> {
    const messageFolderObject = await this.objectMetadataRepository.findOne({
      where: {
        standardId: STANDARD_OBJECT_IDS.messageFolder,
        workspaceId,
      },
    });

    if (!messageFolderObject) {
      this.logger.log(
        `MessageFolder object not found for workspace ${workspaceId}, skipping schema migration`,
      );

      return;
    }

    // Add new enum values for MessageFolderPendingSyncAction
    if (options.dryRun) {
      this.logger.log(
        `Would try to add FOLDER_DELETION to messageFolder_pendingSyncAction_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."messageFolder_pendingSyncAction_enum" ADD VALUE IF NOT EXISTS 'FOLDER_DELETION'`,
        );
        this.logger.log(
          `Added FOLDER_DELETION to messageFolder_pendingSyncAction_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding FOLDER_DELETION to messageFolder_pendingSyncAction_enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }

    if (options.dryRun) {
      this.logger.log(
        `Would try to add FOLDER_IMPORT to messageFolder_pendingSyncAction_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."messageFolder_pendingSyncAction_enum" ADD VALUE IF NOT EXISTS 'FOLDER_IMPORT'`,
        );
        this.logger.log(
          `Added FOLDER_IMPORT to messageFolder_pendingSyncAction_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding FOLDER_IMPORT to messageFolder_pendingSyncAction_enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }

    if (options.dryRun) {
      this.logger.log(
        `Would try to add NONE to messageFolder_pendingSyncAction_enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."messageFolder_pendingSyncAction_enum" ADD VALUE IF NOT EXISTS 'NONE'`,
        );
        this.logger.log(
          `Added NONE to messageFolder_pendingSyncAction_enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding NONE to messageFolder_pendingSyncAction_enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }
  }

  private async updateMessageChannelPendingGroupEmailsActionFieldMetadata(
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

    const pendingGroupEmailsActionField =
      await this.fieldMetadataRepository.findOne({
        where: {
          standardId:
            MESSAGE_CHANNEL_STANDARD_FIELD_IDS.pendingGroupEmailsAction,
          objectMetadataId: messageChannelObject.id,
          workspaceId,
        },
      });

    if (!pendingGroupEmailsActionField) {
      this.logger.log(
        `MessageChannel pendingGroupEmailsAction field not found for workspace ${workspaceId}, skipping field metadata update`,
      );

      return;
    }

    const fieldOptions = (pendingGroupEmailsActionField.options ||
      []) as FieldMetadataComplexOption[];

    const hasGroupEmailsDeletion = fieldOptions.some(
      (option) =>
        option.value ===
        MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_DELETION,
    );

    const hasGroupEmailsImport = fieldOptions.some(
      (option) =>
        option.value ===
        MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_IMPORT,
    );

    const hasNone = fieldOptions.some(
      (option) => option.value === MessageChannelPendingGroupEmailsAction.NONE,
    );

    if (hasGroupEmailsDeletion && hasGroupEmailsImport && hasNone) {
      this.logger.log(
        `MessageChannel pendingGroupEmailsAction field metadata already migrated for workspace ${workspaceId}`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would update MessageChannel pendingGroupEmailsAction field metadata for workspace ${workspaceId}`,
      );

      return;
    }

    if (!hasGroupEmailsDeletion) {
      fieldOptions.push({
        value: MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_DELETION,
        label: 'Group emails deletion',
        position: 0,
        color: 'red',
      });
    }

    if (!hasGroupEmailsImport) {
      fieldOptions.push({
        value: MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_IMPORT,
        label: 'Group emails import',
        position: 1,
        color: 'green',
      });
    }

    if (!hasNone) {
      fieldOptions.push({
        value: MessageChannelPendingGroupEmailsAction.NONE,
        label: 'None',
        position: 2,
        color: 'blue',
      });
    }
    pendingGroupEmailsActionField.options = fieldOptions;

    await this.fieldMetadataRepository.save(pendingGroupEmailsActionField);

    this.logger.log(
      `Updated MessageChannel pendingGroupEmailsAction field metadata for workspace ${workspaceId}`,
    );
  }

  private async updateMessageFolderPendingSyncActionFieldMetadata(
    workspaceId: string,
    options: RunOnWorkspaceArgs['options'],
  ): Promise<void> {
    const messageFolderObject = await this.objectMetadataRepository.findOne({
      where: {
        standardId: STANDARD_OBJECT_IDS.messageFolder,
        workspaceId,
      },
    });

    if (!messageFolderObject) {
      this.logger.log(
        `MessageFolder object not found for workspace ${workspaceId}, skipping field metadata update`,
      );

      return;
    }

    const pendingSyncActionField = await this.fieldMetadataRepository.findOne({
      where: {
        standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.pendingSyncAction,
        objectMetadataId: messageFolderObject.id,
        workspaceId,
      },
    });

    if (!pendingSyncActionField) {
      this.logger.log(
        `MessageFolder pendingSyncAction field not found for workspace ${workspaceId}, skipping field metadata update`,
      );

      return;
    }

    const fieldOptions = (pendingSyncActionField.options ||
      []) as FieldMetadataComplexOption[];

    const hasFolderDeletion = fieldOptions.some(
      (option) =>
        option.value === MessageFolderPendingSyncAction.FOLDER_DELETION,
    );

    const hasFolderImport = fieldOptions.some(
      (option) => option.value === MessageFolderPendingSyncAction.FOLDER_IMPORT,
    );

    const hasNone = fieldOptions.some(
      (option) => option.value === MessageFolderPendingSyncAction.NONE,
    );

    if (hasFolderDeletion && hasFolderImport && hasNone) {
      this.logger.log(
        `MessageFolder pendingSyncAction field metadata already migrated for workspace ${workspaceId}`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would update MessageFolder pendingSyncAction field metadata for workspace ${workspaceId}`,
      );

      return;
    }

    if (!hasFolderDeletion) {
      fieldOptions.push({
        value: MessageFolderPendingSyncAction.FOLDER_DELETION,
        label: 'Folder deletion',
        position: 0,
        color: 'red',
      });
    }

    if (!hasFolderImport) {
      fieldOptions.push({
        value: MessageFolderPendingSyncAction.FOLDER_IMPORT,
        label: 'Folder import',
        position: 1,
        color: 'green',
      });
    }

    if (!hasNone) {
      fieldOptions.push({
        value: MessageFolderPendingSyncAction.NONE,
        label: 'None',
        position: 2,
        color: 'blue',
      });
    }

    pendingSyncActionField.options = fieldOptions;

    await this.fieldMetadataRepository.save(pendingSyncActionField);

    this.logger.log(
      `Updated MessageFolder pendingSyncAction field metadata for workspace ${workspaceId}`,
    );
  }
}
