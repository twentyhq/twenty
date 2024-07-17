import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { QueryRunner, Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceStatusService } from 'src/engine/workspace-manager/workspace-status/services/workspace-status.service';
import { ActivityWorkspaceEntity } from 'src/modules/activity/standard-objects/activity.workspace-entity';

interface UpdateMessageChannelSyncStageEnumCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'migrate-0.22:update-message-channel-sync-stage-enum',
  description: 'Update messageChannel syncStage',
})
export class UpdateActivitiesCommand extends CommandRunner {
  private readonly logger = new Logger(UpdateActivitiesCommand.name);
  constructor(
    private readonly workspaceStatusService: WorkspaceStatusService,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly twentyORMManager: TwentyORMManager,
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
    return this.sharedBoilerplate(_passedParam, options, this.updateActivies);
  }

  async updateActivies(
    queryRunner: QueryRunner,
    schema: string,
    workspaceId: string,
  ) {
    /* await queryRunner.query(
      `ALTER TYPE "${schema}"."messageChannel_visibility_enum" RENAME TO "messageChannel_visibility_enum_old"`,
    ); */

    const activityRepository =
      await this.twentyORMManager.getRepositoryForWorkspace(
        workspaceId,
        ActivityWorkspaceEntity,
      );

    await activityRepository.update(
      { type: 'Task' },
      {
        type: 'TASK',
      },
    );
  }

  // TODO: isolate / build something generic for future commands?
  async sharedBoilerplate(
    _passedParam: string[],
    options: UpdateMessageChannelSyncStageEnumCommandOptions,
    coreLogic: typeof this.updateActivies,
  ) {
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
              coreLogic(queryRunner, dataSourceMetadata.schema, workspaceId);

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
