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
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { notesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/notes-all.view';
import { tasksAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-all.view';
import { tasksByStatusView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-by-status.view';
import { WorkspaceStatusService } from 'src/engine/workspace-manager/workspace-status/services/workspace-status.service';
import { ActivityWorkspaceEntity } from 'src/modules/activity/standard-objects/activity.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

interface UpdateActivitiesCommandOptions {
  workspaceId?: string;
}

type CoreLogicFunction = (params: {
  workspaceId: string;
  queryRunner?: QueryRunner;
  schema?: string;
}) => Promise<void>;

@Command({
  name: 'upgrade-0.23:update-activities-type',
  description: 'Migrate Activity object to Note and Task objects',
})
export class UpdateActivitiesCommand extends CommandRunner {
  private readonly logger = new Logger(UpdateActivitiesCommand.name);

  constructor(
    private readonly workspaceStatusService: WorkspaceStatusService,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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

      const activityRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ActivityWorkspaceEntity>(
          workspaceId,
          'activity',
        );
      const noteRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<NoteWorkspaceEntity>(
          workspaceId,
          'note',
        );
      const noteTargetRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<NoteTargetWorkspaceEntity>(
          workspaceId,
          'noteTarget',
        );
      const taskRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<TaskWorkspaceEntity>(
          workspaceId,
          'task',
        );
      const taskTargetRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<TaskTargetWorkspaceEntity>(
          workspaceId,
          'taskTarget',
        );
      const timelineActivityRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<TimelineActivityWorkspaceEntity>(
          workspaceId,
          'timelineActivity',
        );
      const attachmentRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
          workspaceId,
          'attachment',
        );

      const objectMetadata =
        await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

      const noteObjectMetadataId = objectMetadata.find(
        (object) => object.nameSingular === 'note',
      )?.id;

      const taskObjectMetadataId = objectMetadata.find(
        (object) => object.nameSingular === 'task',
      )?.id;

      const activityObjectMetadataId = objectMetadata.find(
        (object) => object.nameSingular === 'activity',
      )?.id;

      const activitiesToTransfer = await activityRepository.find({
        order: { createdAt: 'ASC' },
        relations: ['activityTargets'],
      });

      for (let i = 0; i < activitiesToTransfer.length; i++) {
        const activity = activitiesToTransfer[i];

        if (activity.type === 'Note') {
          const note = noteRepository.create({
            id: activity.id,
            title: activity.title,
            body: activity.body,
            createdAt: activity.createdAt,
            updatedAt: activity.updatedAt,
            position: i,
          });

          await noteRepository.save(note);

          if (activity.activityTargets && activity.activityTargets.length > 0) {
            const noteTargets = activity.activityTargets.map(
              (activityTarget) => {
                const { activityId, ...activityTargetData } = activityTarget;

                return noteTargetRepository.create({
                  noteId: activityId,
                  ...activityTargetData,
                });
              },
            );

            await noteTargetRepository.save(noteTargets);
          }

          await timelineActivityRepository.update(
            {
              name: 'note.created',
              linkedObjectMetadataId: activityObjectMetadataId,
              linkedRecordId: activity.id,
            },
            {
              linkedObjectMetadataId: noteObjectMetadataId,
              name: 'linked-note.created',
            },
          );

          await timelineActivityRepository.update(
            {
              name: 'note.updated',
              linkedObjectMetadataId: activityObjectMetadataId,
              linkedRecordId: activity.id,
            },
            {
              linkedObjectMetadataId: noteObjectMetadataId,
              name: 'linked-note.updated',
            },
          );

          await attachmentRepository.update(
            {
              activityId: activity.id,
            },
            {
              activityId: null,
              noteId: activity.id,
            },
          );
        } else if (activity.type === 'Task') {
          const task = taskRepository.create({
            id: activity.id,
            title: activity.title,
            body: activity.body,
            status: activity.completedAt ? 'DONE' : 'TODO',
            dueAt: activity.dueAt,
            assigneeId: activity.assigneeId,
            position: i,
            createdAt: activity.createdAt,
            updatedAt: activity.updatedAt,
          });

          await taskRepository.save(task);

          if (activity.activityTargets && activity.activityTargets.length > 0) {
            const taskTargets = activity.activityTargets.map(
              (activityTarget) => {
                const { activityId, ...activityTargetData } = activityTarget;

                return taskTargetRepository.create({
                  taskId: activityId,
                  ...activityTargetData,
                });
              },
            );

            await taskTargetRepository.save(taskTargets);
          }

          await timelineActivityRepository.update(
            {
              name: 'task.created',
              linkedObjectMetadataId: activityObjectMetadataId,
              linkedRecordId: activity.id,
            },
            {
              linkedObjectMetadataId: taskObjectMetadataId,
              name: 'linked-task.created',
            },
          );

          await timelineActivityRepository.update(
            {
              name: 'task.updated',
              linkedObjectMetadataId: activityObjectMetadataId,
              linkedRecordId: activity.id,
            },
            {
              linkedObjectMetadataId: taskObjectMetadataId,
              name: 'linked-task.updated',
            },
          );
          await attachmentRepository.update(
            {
              activityId: activity.id,
            },
            {
              activityId: null,
              taskId: activity.id,
            },
          );
        } else {
          throw new Error(`Unknown activity type: ${activity.type}`);
        }
      }

      // Hack to make sure the command is indempotent and return if one of the view exists
      const viewExists = await queryRunner.manager
        .createQueryBuilder()
        .select()
        .from(`${schema}.view`, 'view')
        .where('name = :name', { name: 'All Notes' })
        .getRawOne();

      if (!viewExists) {
        await this.createViews(
          objectMetadata,
          queryRunner,
          schema,
          workspaceId,
        );
      }
    };

    return this.sharedBoilerplate(_passedParam, options, updateActivities);
  }

  private async createViews(
    objectMetadata: ObjectMetadataEntity[],
    queryRunner: QueryRunner,
    schema: string,
    workspaceId: string,
  ) {
    const objectMetadataMap = objectMetadata.reduce((acc, object) => {
      acc[object.standardId ?? ''] = {
        id: object.id,
        fields: object.fields.reduce((acc, field) => {
          acc[field.standardId ?? ''] = field.id;

          return acc;
        }, {}),
      };

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
          `Migration failed for workspace ${workspaceId}: ${error.message}, ${error.stack}`,
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
