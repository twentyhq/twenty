import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { WorkspaceStatusService } from 'src/engine/workspace-manager/workspace-status/services/workspace-status.service';
import { MessageChannelSyncStage } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

interface UpdateMessageChannelSyncStageEnumCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'migrate-0.22:update-message-channel-sync-stage-enum',
  description: 'Update messageChannel syncStage',
})
export class UpdateMessageChannelSyncStageEnumCommand extends CommandRunner {
  private readonly logger = new Logger(
    UpdateMessageChannelSyncStageEnumCommand.name,
  );
  constructor(
    private readonly workspaceStatusService: WorkspaceStatusService,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id. Command runs on all workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: UpdateMessageChannelSyncStageEnumCommandOptions,
  ): Promise<void> {
    let workspaceIds: string[] = [];

    if (options.workspaceId) {
      workspaceIds = [options.workspaceId];
    } else {
      workspaceIds = await this.workspaceStatusService.getActiveWorkspaceIds();
    }

    if (!workspaceIds.length) {
      this.logger.log(chalk.yellow('No workspace found'));

      return;
    } else {
      this.logger.log(
        chalk.green(`Running command on ${workspaceIds.length} workspaces`),
      );
    }

    for (const workspaceId of workspaceIds) {
      try {
        const dataSourceMetadatas =
          await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
            workspaceId,
          );

        for (const dataSourceMetadata of dataSourceMetadatas) {
          const workspaceDataSource =
            await this.typeORMService.connectToDataSource(dataSourceMetadata);

          if (workspaceDataSource) {
            const queryRunner = workspaceDataSource.createQueryRunner();

            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
              await queryRunner.query(
                `ALTER TYPE "${dataSourceMetadata.schema}"."messageChannel_syncStage_enum" RENAME TO "messageChannel_syncStage_enum_old"`,
              );
              await queryRunner.query(
                `CREATE TYPE "${dataSourceMetadata.schema}"."messageChannel_syncStage_enum" AS ENUM (
              'FULL_MESSAGE_LIST_FETCH_PENDING',
              'PARTIAL_MESSAGE_LIST_FETCH_PENDING',
              'MESSAGE_LIST_FETCH_ONGOING',
              'MESSAGES_IMPORT_PENDING',
              'MESSAGES_IMPORT_ONGOING',
              'FAILED'
            )`,
              );

              await queryRunner.query(
                `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "syncStage" DROP DEFAULT`,
              );
              await queryRunner.query(
                `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "syncStage" TYPE text`,
              );

              await queryRunner.query(
                `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "syncStage" TYPE "${dataSourceMetadata.schema}"."messageChannel_syncStage_enum" USING "syncStage"::text::"${dataSourceMetadata.schema}"."messageChannel_syncStage_enum"`,
              );

              await queryRunner.query(
                `DROP TYPE "${dataSourceMetadata.schema}"."messageChannel_syncStage_enum_old"`,
              );
              await queryRunner.commitTransaction();
            } catch (error) {
              await queryRunner.rollbackTransaction();
              this.logger.log(
                chalk.red(`Running command on workspace ${workspaceId} failed`),
              );
              throw error;
            } finally {
              await queryRunner.release();
            }
          }
        }

        const messageChannelObjectMetadata =
          await this.objectMetadataRepository.findOne({
            where: { nameSingular: 'messageChannel', workspaceId },
          });

        if (!messageChannelObjectMetadata) {
          this.logger.log(
            chalk.yellow(
              `Object metadata for messageChannel not found in workspace ${workspaceId}`,
            ),
          );

          continue;
        }

        const syncStageFieldMetadata =
          await this.fieldMetadataRepository.findOne({
            where: {
              name: 'syncStage',
              workspaceId,
              objectMetadataId: messageChannelObjectMetadata.id,
            },
          });

        if (!syncStageFieldMetadata) {
          this.logger.log(
            chalk.yellow(
              `Field metadata for syncStage not found in workspace ${workspaceId}`,
            ),
          );

          continue;
        }

        const newOptions = [
          {
            id: v4(),
            value: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
            label: 'Full messages list fetch pending',
            position: 0,
            color: 'blue',
          },
          {
            id: v4(),
            value: MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING,
            label: 'Partial messages list fetch pending',
            position: 1,
            color: 'blue',
          },
          {
            id: v4(),
            value: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
            label: 'Messages list fetch ongoing',
            position: 2,
            color: 'orange',
          },
          {
            id: v4(),
            value: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
            label: 'Messages import pending',
            position: 3,
            color: 'blue',
          },
          {
            id: v4(),
            value: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
            label: 'Messages import ongoing',
            position: 4,
            color: 'orange',
          },
          {
            id: v4(),
            value: MessageChannelSyncStage.FAILED,
            label: 'Failed',
            position: 5,
            color: 'red',
          },
        ];

        await this.fieldMetadataRepository.update(syncStageFieldMetadata.id, {
          options: newOptions,
        });

        await this.workspaceCacheVersionService.incrementVersion(workspaceId);

        this.logger.log(
          chalk.green(`Running command on workspace ${workspaceId} done`),
        );
      } catch (error) {
        this.logger.error(
          `Migration failed for workspace ${workspaceId}: ${error.message}`,
        );
      }
    }

    this.logger.log(chalk.green(`Command completed!`));
  }
}
