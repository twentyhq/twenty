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
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TASK_TARGET_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-migration/constant/standard-field-ids';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

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
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `Running UpdateTaskOnDeleteActionCommand for workspace ${workspaceId} (dryRun: ${isDryRun})`,
    );

    this.logger.log(
      `[Phase 1] Starting task relation onDelete action update for workspace ${workspaceId}`,
    );

    await this.updateTaskRelationOnDeleteAction(workspaceId, isDryRun);

    this.logger.log(
      `[Phase 1] Completed task relation onDelete action update for workspace ${workspaceId}`,
    );

    this.logger.log(
      `[Phase 2] Starting orphaned taskTarget cleanup for workspace ${workspaceId}`,
    );

    await this.deleteOrphanedTaskTargets(workspaceId, isDryRun);

    this.logger.log(
      `[Phase 2] Completed orphaned taskTarget cleanup for workspace ${workspaceId}`,
    );

    this.logger.log(
      `UpdateTaskOnDeleteActionCommand completed successfully for workspace ${workspaceId}`,
    );
  }

  private async updateTaskRelationOnDeleteAction(
    workspaceId: string,
    isDryRun: boolean,
  ): Promise<void> {
    this.logger.log(
      `[Step 1/4] Fetching workspace cache for workspace ${workspaceId}`,
    );

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    this.logger.log(
      `[Step 2/4] Looking for taskTarget object metadata in workspace ${workspaceId}`,
    );

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

    this.logger.log(
      `[Step 2/4] Found taskTarget object metadata with id ${taskTargetObjectMetadata.id} that has ${taskTargetObjectMetadata.fieldIds.length} field(s) in workspace ${workspaceId}`,
    );

    this.logger.log(
      `[Step 3/4] Looking for task field on taskTarget object in workspace ${workspaceId}`,
    );

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

    this.logger.log(
      `[Step 3/4] Found task field with id ${taskField.id} in workspace ${workspaceId}`,
    );

    if (taskField.type !== FieldMetadataType.RELATION) {
      this.logger.warn(
        `Task field is not a relation field (type: ${taskField.type}) in workspace ${workspaceId}`,
      );

      return;
    }

    const taskFieldSettings =
      taskField.settings as FieldMetadataSettingsMapping['RELATION'];

    if (taskFieldSettings?.onDelete === RelationOnDeleteAction.CASCADE) {
      this.logger.log(
        `[Step 4/4] Task relation already has CASCADE onDelete in workspace ${workspaceId}, skipping update`,
      );

      return;
    }

    this.logger.log(
      `[Step 4/4] Updating task relation onDelete from ${taskFieldSettings?.onDelete ?? 'undefined'} to CASCADE in workspace ${workspaceId}`,
    );

    if (!isDryRun) {
      const updatedSettings: FieldMetadataSettingsMapping['RELATION'] = {
        ...taskFieldSettings,
        onDelete: RelationOnDeleteAction.CASCADE,
      };

      const updatedTaskField = {
        ...taskField,
        settings: updatedSettings,
        updatedAt: new Date().toISOString(),
      };

      this.logger.log(
        `[Step 4/4] Calling validateBuildAndRunWorkspaceMigration for field ${taskField.id} in workspace ${workspaceId}`,
      );

      try {
        const { twentyStandardFlatApplication } =
          await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
            { workspaceId },
          );

        const validateAndBuildResult =
          await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
            {
              allFlatEntityOperationByMetadataName: {
                fieldMetadata: {
                  flatEntityToCreate: [],
                  flatEntityToDelete: [],
                  flatEntityToUpdate: [updatedTaskField],
                },
              },
              workspaceId,
              isSystemBuild: true,
              applicationUniversalIdentifier:
                twentyStandardFlatApplication.universalIdentifier,
            },
          );

        this.logger.error(
          `[Step 4/4] Validation result: ${JSON.stringify(validateAndBuildResult, null, 2)}`,
        );

        if (isDefined(validateAndBuildResult)) {
          this.logger.error(
            `[Step 4/4] Failed to update task relation onDelete in workspace ${workspaceId}`,
          );

          throw new Error(
            `Failed to update task relation onDelete in workspace ${workspaceId}`,
          );
        }

        this.logger.log(
          `[Step 4/4] Successfully updated task relation onDelete to CASCADE in workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `[Step 4/4] Failed to update task relation onDelete in workspace ${workspaceId}`,
        );
        this.logger.error(
          `[Step 4/4] Field id: ${taskField.id}, current settings: ${JSON.stringify(taskFieldSettings)}`,
        );
        this.logger.error(
          `[Step 4/4] Target settings: ${JSON.stringify(updatedSettings)}`,
        );
        this.logger.error(
          `[Step 4/4] Error message: ${error instanceof Error ? error.message : String(error)}`,
        );
        this.logger.error(
          `[Step 4/4] Error stack: ${error instanceof Error ? error.stack : 'No stack available'}`,
        );

        this.logger.error(JSON.stringify(error, null, 2));

        throw error;
      }
    } else {
      this.logger.log(
        `[Step 4/4] DRY RUN: Would update task relation onDelete to CASCADE in workspace ${workspaceId}`,
      );
    }
  }

  private async deleteOrphanedTaskTargets(
    workspaceId: string,
    isDryRun: boolean,
  ): Promise<void> {
    this.logger.log(
      `[Orphan cleanup 1/3] Getting taskTarget repository for workspace ${workspaceId}`,
    );

    const taskTargetRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'taskTarget',
        { shouldBypassPermissionChecks: true },
      );

    this.logger.log(
      `[Orphan cleanup 2/3] Searching for orphaned taskTarget records (taskId is null) in workspace ${workspaceId}`,
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
      `[Orphan cleanup 2/3] Found ${orphanedCount} orphaned taskTarget record(s) in workspace ${workspaceId}`,
    );

    if (orphanedCount === 0) {
      this.logger.log(
        `[Orphan cleanup 3/3] No orphaned records to delete in workspace ${workspaceId}`,
      );

      return;
    }

    if (!isDryRun) {
      const orphanedIds = orphanedTaskTargets.map((record) => record.id);

      const batchSize = 100;
      const totalBatches = Math.ceil(orphanedIds.length / batchSize);

      this.logger.log(
        `[Orphan cleanup 3/3] Deleting ${orphanedCount} orphaned taskTarget record(s) in ${totalBatches} batch(es) in workspace ${workspaceId}`,
      );

      for (let i = 0; i < orphanedIds.length; i += batchSize) {
        const batch = orphanedIds.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        this.logger.log(
          `[Orphan cleanup 3/3] Deleting batch ${batchNumber}/${totalBatches} (${batch.length} records) in workspace ${workspaceId}`,
        );

        try {
          await taskTargetRepository
            .createQueryBuilder()
            .delete()
            .whereInIds(batch)
            .execute();
        } catch (error) {
          this.logger.error(
            `[Orphan cleanup 3/3] Failed to delete batch ${batchNumber}/${totalBatches} in workspace ${workspaceId}`,
          );
          this.logger.error(
            `[Orphan cleanup 3/3] Batch record ids: ${JSON.stringify(batch)}`,
          );
          this.logger.error(
            `[Orphan cleanup 3/3] Error message: ${error instanceof Error ? error.message : String(error)}`,
          );
          this.logger.error(
            `[Orphan cleanup 3/3] Error stack: ${error instanceof Error ? error.stack : 'No stack available'}`,
          );

          throw error;
        }
      }

      this.logger.log(
        `[Orphan cleanup 3/3] Successfully deleted ${orphanedCount} orphaned taskTarget record(s) in workspace ${workspaceId}`,
      );
    } else {
      this.logger.log(
        `[Orphan cleanup 3/3] DRY RUN: Would delete ${orphanedCount} orphaned taskTarget record(s) in workspace ${workspaceId}`,
      );
    }
  }
}
