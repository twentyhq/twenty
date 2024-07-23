import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { notesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/notes-all.view';
import { tasksAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-all.view';
import { tasksByStatusView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-by-status.view';
import { WorkspaceStatusService } from 'src/engine/workspace-manager/workspace-status/services/workspace-status.service';

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
      /*********************** 
      // Transfer Activities to NOTE + Tasks
      ***********************/
      /* const activitiesToUpdate = await activityRepository.find({
        where: [{ position: IsNull() }],
        order: { createdAt: 'ASC' },
      });

      for (let i = 0; i < activitiesToUpdate.length; i++) {
        const activity = activitiesToUpdate[i];

        activity.position = i;
        await activityRepository.save(activity);
      }*/

      /*********************** 
      // Create missing views
      ***********************/
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
      }, {}) as Record<string, ObjectMetadataEntity>;

      const viewDefinitions = [
        await notesAllView(objectMetadataMap),
        await tasksAllView(objectMetadataMap),
        await tasksByStatusView(objectMetadataMap),
      ];

      const viewDefinitionsWithId = viewDefinitions.map((viewDefinition) => ({
        ...viewDefinition,
        id: v4(),
      }));

      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(`${schema}.view`, [
          'id',
          'name',
          'objectMetadataId',
          'type',
          'key',
          'position',
          'icon',
          'kanbanFieldMetadataId',
        ])
        .values(
          viewDefinitionsWithId.map(
            ({
              id,
              name,
              objectMetadataId,
              type,
              key,
              position,
              icon,
              kanbanFieldMetadataId,
            }) => ({
              id,
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

      for (const viewDefinition of viewDefinitionsWithId) {
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
                viewId: viewDefinition.id,
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
                viewId: viewDefinition.id,
              })),
            )
            .execute();
        }

        await this.workspaceCacheVersionService.incrementVersion(workspaceId);
      }

      return this.sharedBoilerplate(_passedParam, options, updateActivities);
    };
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
