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
import { MessageChannelSyncStatus } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

interface MigrateMessageChannelSyncStatusEnumCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.23:update-message-channel-sync-status-enum',
  description: 'Migrate messageChannel syncStatus enum',
})
export class MigrateMessageChannelSyncStatusEnumCommand extends CommandRunner {
  private readonly logger = new Logger(
    MigrateMessageChannelSyncStatusEnumCommand.name,
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
    options: MigrateMessageChannelSyncStatusEnumCommandOptions,
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
                `ALTER TYPE "${dataSourceMetadata.schema}"."messageChannel_syncStatus_enum" RENAME TO "messageChannel_syncStatus_enum_old"`,
              );
              await queryRunner.query(
                `CREATE TYPE "${dataSourceMetadata.schema}"."messageChannel_syncStatus_enum" AS ENUM (
                  'ONGOING',
                  'NOT_SYNCED',
                  'ACTIVE',
                  'FAILED_INSUFFICIENT_PERMISSIONS',
                  'FAILED_UNKNOWN'
            )`,
              );

              await queryRunner.query(
                `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "syncStatus" DROP DEFAULT`,
              );
              await queryRunner.query(
                `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "syncStatus" TYPE text`,
              );

              await queryRunner.query(
                `UPDATE "${dataSourceMetadata.schema}"."messageChannel" SET "syncStatus" = 'ACTIVE' WHERE "syncStatus" = 'COMPLETED'`,
              );

              await queryRunner.query(
                `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "syncStatus" TYPE "${dataSourceMetadata.schema}"."messageChannel_syncStatus_enum" USING "syncStatus"::text::"${dataSourceMetadata.schema}"."messageChannel_syncStatus_enum"`,
              );

              await queryRunner.query(
                `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "syncStatus" SET DEFAULT NULL`,
              );

              await queryRunner.query(
                `DROP TYPE "${dataSourceMetadata.schema}"."messageChannel_syncStatus_enum_old"`,
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

        const syncStatusFieldMetadata =
          await this.fieldMetadataRepository.findOne({
            where: {
              name: 'syncStatus',
              workspaceId,
              objectMetadataId: messageChannelObjectMetadata.id,
            },
          });

        if (!syncStatusFieldMetadata) {
          this.logger.log(
            chalk.yellow(
              `Field metadata for syncStatus not found in workspace ${workspaceId}`,
            ),
          );

          continue;
        }

        const newOptions = [
          {
            id: v4(),
            value: MessageChannelSyncStatus.ONGOING,
            label: 'Ongoing',
            position: 1,
            color: 'yellow',
          },
          {
            id: v4(),
            value: MessageChannelSyncStatus.NOT_SYNCED,
            label: 'Not Synced',
            position: 2,
            color: 'blue',
          },
          {
            id: v4(),
            value: MessageChannelSyncStatus.ACTIVE,
            label: 'Active',
            position: 3,
            color: 'green',
          },
          {
            id: v4(),
            value: MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
            label: 'Failed Insufficient Permissions',
            position: 4,
            color: 'red',
          },
          {
            id: v4(),
            value: MessageChannelSyncStatus.FAILED_UNKNOWN,
            label: 'Failed Unknown',
            position: 5,
            color: 'red',
          },
        ];

        await this.fieldMetadataRepository.update(syncStatusFieldMetadata.id, {
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
