import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { IsNull, QueryRunner } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceStatusService } from 'src/engine/workspace-manager/workspace-status/services/workspace-status.service';
import { ActivityWorkspaceEntity } from 'src/modules/activity/standard-objects/activity.workspace-entity';

interface UpdateActivitiesCommandOptions {
  workspaceId?: string;
}

type CoreLogicFunction = (params: {
  workspaceId: string;
  queryRunner?: QueryRunner;
  schema?: string;
}) => Promise<void>;

@Command({
  name: 'migrate-0.23:update-activities-type',
  description:
    'Update activities.type to change Note to NOTE and Task to TASK, backfill activity.position, update activity.body when null',
})
export class UpdateActivitiesCommand extends CommandRunner {
  private readonly logger = new Logger(UpdateActivitiesCommand.name);

  constructor(
    private readonly workspaceStatusService: WorkspaceStatusService,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
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
    options: UpdateActivitiesCommandOptions,
  ): Promise<void> {
    const updateActivities = async ({
      workspaceId,
    }: {
      workspaceId: string;
    }): Promise<void> => {
      const activityRepository =
        await this.twentyORMManager.getRepositoryForWorkspace(
          workspaceId,
          ActivityWorkspaceEntity,
        );

      await activityRepository.update(
        { typeDeprecated: 'Task' },
        {
          type: 'TASK',
        },
      );

      await activityRepository.update(
        { typeDeprecated: 'Note' },
        {
          type: 'NOTE',
        },
      );

      await activityRepository.update(
        { body: '' },
        {
          body: null,
        },
      );

      const activitiesToUpdate = await activityRepository.find({
        where: [{ position: IsNull() }],
        order: { createdAt: 'ASC' },
      });

      for (let i = 0; i < activitiesToUpdate.length; i++) {
        const activity = activitiesToUpdate[i];

        activity.position = i;
        await activityRepository.save(activity);
      }
    };

    return this.sharedBoilerplate(_passedParam, options, updateActivities);
  }

  // This is an attempt to do something more generic that could be reused in every command
  // Next step if it works well for a few command is to isolated it into a file so
  // it can be reused and not copy-pasted.

  async sharedBoilerplate(
    _passedParam: string[],
    options: UpdateActivitiesCommandOptions,
    coreLogic: CoreLogicFunction,
  ) {
    const workspaceIds = options.workspaceId
      ? [options.workspaceId]
      : await this.workspaceStatusService.getActiveWorkspaceIds();

    if (!workspaceIds.length) {
      this.logger.log(chalk.yellow('No workspace found'));

      return;
    }

    this.logger.log(
      chalk.green(`Running command on ${workspaceIds.length} workspaces`),
    );

    const requiresQueryRunner = coreLogic.toString().includes('queryRunner');

    for (const workspaceId of workspaceIds) {
      try {
        if (requiresQueryRunner) {
          await this.executeWithQueryRunner(workspaceId, coreLogic);
        } else {
          await coreLogic({ workspaceId });
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

  private async executeWithQueryRunner(
    workspaceId: string,
    coreLogic: CoreLogicFunction,
  ) {
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
          await coreLogic({
            workspaceId,
            queryRunner,
            schema: dataSourceMetadata.schema,
          });
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
  }
}
