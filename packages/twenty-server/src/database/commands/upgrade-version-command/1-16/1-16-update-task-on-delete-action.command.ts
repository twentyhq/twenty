import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import {
  FieldMetadataSettingsMapping,
  FieldMetadataType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TASK_TARGET_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-migration/constant/standard-field-ids';

@Command({
  name: 'upgrade:1-16:update-task-on-delete-action',
  description:
    'Update task relation onDelete action to CASCADE and delete orphaned taskTarget records',
})
export class UpdateTaskOnDeleteActionCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(UpdateTaskOnDeleteActionCommand.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `Running UpdateTaskOnDeleteActionCommand for workspace ${workspaceId}`,
    );

    await this.updateTaskRelationOnDeleteAction(workspaceId, isDryRun);

    await this.deleteOrphanedTaskTargets(workspaceId, isDryRun);
  }

  private async updateTaskRelationOnDeleteAction(
    workspaceId: string,
    isDryRun: boolean,
  ): Promise<void> {
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const taskTargetObjectMetadata = Object.values(
      flatObjectMetadataMaps.byId,
    ).find(
      (objectMetadata) =>
        objectMetadata?.standardId === STANDARD_OBJECT_IDS.taskTarget,
    );

    if (!isDefined(taskTargetObjectMetadata)) {
      this.logger.warn(
        `TaskTarget object metadata not found in workspace ${workspaceId}`,
      );

      return;
    }

    const taskTargetFields = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: taskTargetObjectMetadata.fieldIds,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    const taskField = taskTargetFields.find(
      (field) => field.standardId === TASK_TARGET_STANDARD_FIELD_IDS.task,
    );

    if (!isDefined(taskField)) {
      this.logger.warn(
        `Task field not found on taskTarget object in workspace ${workspaceId}`,
      );

      return;
    }

    if (taskField.type !== FieldMetadataType.RELATION) {
      this.logger.warn(
        `Task field is not a relation field in workspace ${workspaceId}`,
      );

      return;
    }

    const taskFieldSettings =
      taskField.settings as FieldMetadataSettingsMapping['RELATION'];

    if (taskFieldSettings?.onDelete === RelationOnDeleteAction.CASCADE) {
      this.logger.log(
        `Task relation already has CASCADE onDelete in workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Updating task relation onDelete from ${taskFieldSettings?.onDelete} to CASCADE in workspace ${workspaceId}`,
    );

    if (!isDryRun) {
      const updatedSettings: FieldMetadataSettingsMapping['RELATION'] = {
        ...taskFieldSettings,
        onDelete: RelationOnDeleteAction.CASCADE,
      };

      try {
        await this.fieldMetadataService.updateOneField({
          updateFieldInput: {
            id: taskField.id,
            settings: updatedSettings,
          },
          workspaceId,
          isSystemBuild: true,
        });
      } catch (error) {
        this.logger.debug(`Error details: ${JSON.stringify(error)}`);

        throw error;
      }

      this.logger.log(
        `Successfully updated task relation onDelete to CASCADE in workspace ${workspaceId}`,
      );
    } else {
      this.logger.log(
        `DRY RUN: Would update task relation onDelete to CASCADE in workspace ${workspaceId}`,
      );
    }
  }

  private async deleteOrphanedTaskTargets(
    workspaceId: string,
    isDryRun: boolean,
  ): Promise<void> {
    const taskTargetRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'taskTarget',
        { shouldBypassPermissionChecks: true },
      );

    const orphanedTaskTargets = await taskTargetRepository.find({
      withDeleted: true,
      select: ['id'],
      where: {
        taskId: IsNull(),
      },
    });

    const orphanedCount = orphanedTaskTargets.length;

    this.logger.log(
      `Found ${orphanedCount} orphaned taskTarget record(s) in workspace ${workspaceId}`,
    );

    if (orphanedCount === 0) {
      return;
    }

    if (!isDryRun) {
      const orphanedIds = orphanedTaskTargets.map((record) => record.id);

      const batchSize = 100;

      for (let i = 0; i < orphanedIds.length; i += batchSize) {
        const batch = orphanedIds.slice(i, i + batchSize);

        await taskTargetRepository
          .createQueryBuilder()
          .delete()
          .whereInIds(batch)
          .execute();
      }

      this.logger.log(
        `Deleted ${orphanedCount} orphaned taskTarget record(s) in workspace ${workspaceId}`,
      );
    } else {
      this.logger.log(
        `DRY RUN: Would delete ${orphanedCount} orphaned taskTarget record(s) in workspace ${workspaceId}`,
      );
    }
  }
}
