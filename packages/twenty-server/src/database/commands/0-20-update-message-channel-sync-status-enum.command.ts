import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';
import chalk from 'chalk';
import { v4 } from 'uuid';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { MessageChannelSyncStatus } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

interface UpdateMessageChannelSyncStatusEnumCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'migrate-0.20:update-message-channel-sync-status-enum',
  description: 'Update messageChannel syncStatus',
})
export class UpdateMessageChannelSyncStatusEnumCommand extends CommandRunner {
  private readonly logger = new Logger(
    UpdateMessageChannelSyncStatusEnumCommand.name,
  );
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
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
    options: UpdateMessageChannelSyncStatusEnumCommandOptions,
  ): Promise<void> {
    let workspaceIds: string[] = [];

    if (options.workspaceId) {
      workspaceIds = [options.workspaceId];
    } else {
      workspaceIds = (await this.workspaceRepository.find()).map(
        (workspace) => workspace.id,
      );
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
              `CREATE TYPE "${dataSourceMetadata.schema}"."messageChannel_syncStatus_enum" AS ENUM ('PENDING',
              'SUCCEEDED',
              'FAILED',
              'ONGOING',
              'NOT_SYNCED',
              'COMPLETED',
              'FAILED_INSUFFICIENT_PERMISSIONS',
              'FAILED_UNKNOWN')`,
            );

            await queryRunner.query(
              `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "syncStatus" DROP DEFAULT`,
            );
            await queryRunner.query(
              `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "syncStatus" TYPE text`,
            );

            await queryRunner.query(
              `ALTER TABLE "${dataSourceMetadata.schema}"."messageChannel" ALTER COLUMN "syncStatus" TYPE "${dataSourceMetadata.schema}"."messageChannel_syncStatus_enum" USING "syncStatus"::text::"${dataSourceMetadata.schema}"."messageChannel_syncStatus_enum"`,
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
          value: MessageChannelSyncStatus.PENDING,
          label: 'Pending',
          position: 0,
          color: 'blue',
        },
        {
          id: v4(),
          value: MessageChannelSyncStatus.SUCCEEDED,
          label: 'Succeeded',
          position: 2,
          color: 'green',
        },
        {
          id: v4(),
          value: MessageChannelSyncStatus.FAILED,
          label: 'Failed',
          position: 3,
          color: 'red',
        },
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
          position: 4,
          color: 'blue',
        },
        {
          id: v4(),
          value: MessageChannelSyncStatus.COMPLETED,
          label: 'Completed',
          position: 5,
          color: 'green',
        },
        {
          id: v4(),
          value: MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
          label: 'Failed Insufficient Permissions',
          position: 6,
          color: 'red',
        },
        {
          id: v4(),
          value: MessageChannelSyncStatus.FAILED_UNKNOWN,
          label: 'Failed Unknown',
          position: 7,
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
    }

    this.logger.log(chalk.green(`Command completed!`));
  }
}
