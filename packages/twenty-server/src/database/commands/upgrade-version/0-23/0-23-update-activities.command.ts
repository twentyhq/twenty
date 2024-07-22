import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { IsNull, Not, QueryRunner } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { activitiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/activities-all.view';
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
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly objectMetadataService: ObjectMetadataService,
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
      queryRunner,
      schema,
    }: {
      workspaceId: string;
      queryRunner: QueryRunner;
      schema: string;
    }): Promise<void> => {
      const activityRepository =
        await this.twentyORMManager.getRepositoryForWorkspace(
          workspaceId,
          ActivityWorkspaceEntity,
        );

      // Migrate type field to enum
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

      // Converting body from text to rich text
      await activityRepository.update(
        { body: '' },
        {
          body: null,
        },
      );

      // Introducing status and deprecating completedAt
      await activityRepository.update(
        { completedAt: Not(IsNull()) },
        {
          status: 'DONE',
        },
      );

      // Backfill positions
      const activitiesToUpdate = await activityRepository.find({
        where: [{ position: IsNull() }],
        order: { createdAt: 'ASC' },
      });

      for (let i = 0; i < activitiesToUpdate.length; i++) {
        const activity = activitiesToUpdate[i];

        activity.position = i;
        await activityRepository.save(activity);
      }

      // Create missing views
      const objectMetadata =
        await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

      const objectMetadataMap = objectMetadata.reduce((acc, object) => {
        acc[object.standardId ?? ''] = {
          id: object.id,
          fields: object.fields.reduce((acc, field) => {
            acc[field.standardId ?? ''] = field.id;

            return acc;
          }, {}),
        };
        schema;

        return acc;
      }, {});

      const viewDefinitions = [await activitiesAllView(objectMetadataMap)];

      const createdViews = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(`${schema}.view`, [
          'name',
          'objectMetadataId',
          'type',
          'key',
          'position',
          'icon',
          'kanbanFieldMetadataId',
        ])
        .values(
          viewDefinitions.map(
            ({
              name,
              objectMetadataId,
              type,
              key,
              position,
              icon,
              kanbanFieldMetadataId,
            }) => ({
              name,
              objectMetadataId,
              type,
              key,
              position,
              icon,
              kanbanFieldMetadataId,
            }),
          ),
        )
        .returning('*')
        .execute();

      const viewIdMap = createdViews.raw.reduce((acc, view) => {
        acc[view.name] = view.id;

        return acc;
      }, {});

      for (const viewDefinition of viewDefinitions) {
        if (viewDefinition.fields && viewDefinition.fields.length > 0) {
          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(`${schema}.viewField`, [
              'fieldMetadataId',
              'position',
              'isVisible',
              'size',
              'viewId',
            ])
            .values(
              viewDefinition.fields.map((field) => ({
                fieldMetadataId: field.fieldMetadataId,
                position: field.position,
                isVisible: field.isVisible,
                size: field.size,
                viewId: viewIdMap[viewDefinition.name],
              })),
            )
            .execute();
        }

        if (viewDefinition.filters && viewDefinition.filters.length > 0) {
          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(`${schema}.viewFilter`, [
              'fieldMetadataId',
              'displayValue',
              'operand',
              'value',
              'viewId',
            ])
            .values(
              viewDefinition.filters.map((filter: any) => ({
                fieldMetadataId: filter.fieldMetadataId,
                displayValue: filter.displayValue,
                operand: filter.operand,
                value: filter.value,
                viewId: viewIdMap[viewDefinition.name],
              })),
            )
            .execute();
        }
      }

      await this.workspaceCacheVersionService.incrementVersion(workspaceId);
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

    const requiresQueryRunner =
      coreLogic.toString().includes('queryRunner') ||
      coreLogic.toString().includes('schema');

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
