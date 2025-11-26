import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { MESSAGE_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MessageChannelSyncStage } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Command({
  name: 'upgrade:1-12:add-messages-import-scheduled-sync-stage',
  description:
    'Replace message channel syncStage enum with complete MessageChannelSyncStage values and update default to PENDING_CONFIGURATION',
})
export class AddMessagesImportScheduledSyncStageCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
      `Updating message channel syncStage enum and default value for workspace ${workspaceId}`,
    );

    await this.updateMessageChannelSyncStageFieldMetadata(workspaceId, options);

    await this.addMessagesImportScheduledEnumValue(workspaceId, options);

    this.logger.log(
      `Successfully updated message channel syncStage enum and default value for workspace ${workspaceId}`,
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
    const tableName = 'messageChannel';
    const columnName = 'syncStage';
    const enumName = 'messageChannel_syncStage_enum';

    if (options.dryRun) {
      this.logger.log(
        `Would replace ${enumName} with complete MessageChannelSyncStage enum values for workspace ${workspaceId}`,
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

      // Create new enum with all MessageChannelSyncStage values
      await queryRunner.query(
        `CREATE TYPE ${schemaName}."${enumName}" AS ENUM (
          '${MessageChannelSyncStage.PENDING_CONFIGURATION}',
          '${MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING}',
          '${MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED}',
          '${MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING}',
          '${MessageChannelSyncStage.MESSAGES_IMPORT_PENDING}',
          '${MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED}',
          '${MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING}',
          '${MessageChannelSyncStage.FAILED}'
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
         ALTER COLUMN "${columnName}" SET DEFAULT '${MessageChannelSyncStage.PENDING_CONFIGURATION}'::${schemaName}."${enumName}"`,
      );

      await queryRunner.commitTransaction();

      this.logger.log(
        `Successfully replaced ${enumName} with complete MessageChannelSyncStage enum values and updated default to PENDING_CONFIGURATION for workspace ${workspaceId}`,
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

    if (options.dryRun) {
      this.logger.log(
        `Would add MESSAGES_IMPORT_SCHEDULED to MessageChannel syncStage field metadata for workspace ${workspaceId}`,
      );

      return;
    }

    const syncStageFieldOptions = [
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
    ];

    syncStageField.options = syncStageFieldOptions;
    syncStageField.defaultValue = `'${MessageChannelSyncStage.PENDING_CONFIGURATION}'`;

    await this.fieldMetadataRepository.save(syncStageField);

    this.logger.log(
      `Added MESSAGES_IMPORT_SCHEDULED to MessageChannel syncStage field metadata for workspace ${workspaceId}`,
    );
  }
}
