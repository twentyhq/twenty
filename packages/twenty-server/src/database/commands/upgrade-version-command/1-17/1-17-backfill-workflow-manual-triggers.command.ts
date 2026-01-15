import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Raw, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import {
  ManualTriggerAvailabilityType,
  type ManualTriggerWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/manual-trigger.workspace-entity';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionTriggerIsDefined } from 'src/modules/workflow/common/utils/assert-workflow-version-trigger-is-defined.util';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Command({
  name: 'upgrade:1-17:backfill-workflow-manual-triggers',
  description:
    'Backfill ManualTrigger entities from active WorkflowVersions with MANUAL trigger type',
})
export class BackfillWorkflowManualTriggersCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    BackfillWorkflowManualTriggersCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Starting backfill of ManualTrigger entities for workspace ${workspaceId}`,
    );

    const objectExists = await this.backfillManualTriggerMetadata({
      workspaceId,
      options,
    });

    await this.backfillManualTriggerRecords({
      workspaceId,
      options,
      objectExists,
    });

    this.logger.log(
      `Successfully backfilled ManualTrigger entities for workspace ${workspaceId}`,
    );
  }

  private addEntitiesToFlatMaps<T extends SyncableFlatEntity>(
    fromMaps: FlatEntityMaps<T>,
    entities: T[],
  ): FlatEntityMaps<T> {
    const byId = { ...fromMaps.byId };
    const idByUniversalIdentifier = { ...fromMaps.idByUniversalIdentifier };
    const universalIdentifiersByApplicationId = {
      ...fromMaps.universalIdentifiersByApplicationId,
    };

    for (const entity of entities) {
      byId[entity.id] = entity;
      idByUniversalIdentifier[entity.universalIdentifier] = entity.id;

      if (isDefined(entity.applicationId)) {
        const existingIdentifiers =
          universalIdentifiersByApplicationId[entity.applicationId] ?? [];

        universalIdentifiersByApplicationId[entity.applicationId] = [
          ...existingIdentifiers,
          entity.universalIdentifier,
        ];
      }
    }

    return {
      byId,
      idByUniversalIdentifier,
      universalIdentifiersByApplicationId,
    };
  }

  private async backfillManualTriggerMetadata({
    workspaceId,
    options,
  }: {
    workspaceId: string;
    options: RunOnWorkspaceArgs['options'];
  }): Promise<boolean> {
    const {
      featureFlagsMap,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'featureFlagsMap',
    ]);

    const manualTriggerObject = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: STANDARD_OBJECTS.manualTrigger.universalIdentifier,
    });

    if (isDefined(manualTriggerObject)) {
      this.logger.log(
        `ManualTrigger object already exists in workspace ${workspaceId}, skipping metadata backfill`,
      );

      return true;
    }

    // Find workspace's WorkflowVersion object - required for the relation
    const workspaceWorkflowVersion = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: STANDARD_OBJECTS.workflowVersion.universalIdentifier,
    });

    if (!isDefined(workspaceWorkflowVersion)) {
      this.logger.log(
        `WorkflowVersion object not found in workspace ${workspaceId}, skipping metadata backfill`,
      );

      return false;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const allStandardFlatEntityMaps =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    // Extract ManualTrigger object from standard maps
    const manualTriggerObjectFromStandard = findFlatEntityByUniversalIdentifier(
      {
        flatEntityMaps: allStandardFlatEntityMaps.flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.manualTrigger.universalIdentifier,
      },
    );

    if (!isDefined(manualTriggerObjectFromStandard)) {
      throw new Error('ManualTrigger object not found in standard objects');
    }

    const standardManualTriggerId = manualTriggerObjectFromStandard.id;

    // Get WorkflowVersion from standard maps (to find field IDs for cross-referencing)
    const standardWorkflowVersion = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: allStandardFlatEntityMaps.flatObjectMetadataMaps,
      universalIdentifier: STANDARD_OBJECTS.workflowVersion.universalIdentifier,
    });

    if (!isDefined(standardWorkflowVersion)) {
      throw new Error('WorkflowVersion object not found in standard objects');
    }

    // Get all ManualTrigger fields from standard maps
    const allManualTriggerFields = Object.values(
      allStandardFlatEntityMaps.flatFieldMetadataMaps.byId,
    ).filter(
      (field): field is FlatFieldMetadata =>
        isDefined(field) && field.objectMetadataId === standardManualTriggerId,
    );

    // Get the manualTriggers field from WorkflowVersion standard maps
    const standardManualTriggersField = Object.values(
      allStandardFlatEntityMaps.flatFieldMetadataMaps.byId,
    ).find(
      (field): field is FlatFieldMetadata =>
        isDefined(field) &&
        field.objectMetadataId === standardWorkflowVersion.id &&
        field.name === 'manualTriggers',
    );

    if (!isDefined(standardManualTriggersField)) {
      throw new Error(
        'manualTriggers field not found on WorkflowVersion in standard objects',
      );
    }

    // Find the workflowVersion field on ManualTrigger
    const standardWorkflowVersionField = allManualTriggerFields.find(
      (field) =>
        field.name === 'workflowVersion' &&
        field.type === FieldMetadataType.RELATION,
    );

    if (!isDefined(standardWorkflowVersionField)) {
      throw new Error(
        'workflowVersion field not found on ManualTrigger in standard objects',
      );
    }

    // Update the manualTriggers field to point to workspace's WorkflowVersion
    const updatedManualTriggersField: FlatFieldMetadata = {
      ...standardManualTriggersField,
      objectMetadataId: workspaceWorkflowVersion.id,
      relationTargetObjectMetadataId: standardManualTriggerId,
      relationTargetFieldMetadataId: standardWorkflowVersionField.id,
    };

    // Update the workflowVersion field to point to workspace's WorkflowVersion
    const updatedWorkflowVersionField: FlatFieldMetadata = {
      ...standardWorkflowVersionField,
      relationTargetObjectMetadataId: workspaceWorkflowVersion.id,
      relationTargetFieldMetadataId: updatedManualTriggersField.id,
    };

    // Get non-relation fields (they don't need modification)
    const nonRelationFields = allManualTriggerFields.filter(
      (field) => field.type !== FieldMetadataType.RELATION,
    );

    // Combine all fields to add
    const fieldsToAdd = [
      ...nonRelationFields,
      updatedWorkflowVersionField,
      updatedManualTriggersField,
    ];

    // Get ManualTrigger indexes from standard maps
    const manualTriggerIndexes = Object.values(
      allStandardFlatEntityMaps.flatIndexMaps.byId,
    ).filter(
      (index): index is FlatIndexMetadata =>
        isDefined(index) && index.objectMetadataId === standardManualTriggerId,
    );

    // Build "to" maps by adding ManualTrigger entities to current workspace state
    const toFlatObjectMetadataMaps =
      this.addEntitiesToFlatMaps<FlatObjectMetadata>(flatObjectMetadataMaps, [
        manualTriggerObjectFromStandard,
      ]);

    const toFlatFieldMetadataMaps =
      this.addEntitiesToFlatMaps<FlatFieldMetadata>(
        flatFieldMetadataMaps,
        fieldsToAdd,
      );

    const toFlatIndexMaps = this.addEntitiesToFlatMaps<FlatIndexMetadata>(
      flatIndexMaps,
      manualTriggerIndexes,
    );

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would create ManualTrigger object metadata for workspace ${workspaceId}`,
      );

      return false;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          buildOptions: {
            isSystemBuild: true,
          },
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: {
              from: flatObjectMetadataMaps,
              to: toFlatObjectMetadataMaps,
            },
            flatFieldMetadataMaps: {
              from: flatFieldMetadataMaps,
              to: toFlatFieldMetadataMaps,
            },
            flatIndexMaps: {
              from: flatIndexMaps,
              to: toFlatIndexMaps,
            },
          },
          workspaceId,
          additionalCacheDataMaps: {
            featureFlagsMap,
          },
          dependencyAllFlatEntityMaps: {
            flatObjectMetadataMaps: toFlatObjectMetadataMaps,
          },
        },
      );

    if (isDefined(validateAndBuildResult)) {
      this.logger.error(
        `Failed to create ManualTrigger object metadata: ${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
      throw new Error(
        `Failed to create ManualTrigger object metadata for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully backfilled ManualTrigger object metadata for workspace ${workspaceId}`,
    );

    // Invalidate and recompute cache so the ORM can find the new ManualTrigger object
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'ORMEntityMetadatas',
    ]);

    return true;
  }

  private async backfillManualTriggerRecords({
    workspaceId,
    options,
    objectExists,
  }: {
    workspaceId: string;
    options: RunOnWorkspaceArgs['options'];
    objectExists: boolean;
  }): Promise<void> {
    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const manualTriggerVersions = await workflowVersionRepository.find({
      where: {
        status: WorkflowVersionStatus.ACTIVE,
        trigger: Raw(() => `"workflowVersion"."trigger"->>'type' = 'MANUAL'`),
      },
      relations: ['workflow'],
    });

    this.logger.log(
      `Found ${manualTriggerVersions.length} active workflow versions with MANUAL trigger type`,
    );

    if (manualTriggerVersions.length === 0) {
      this.logger.log(
        `No active workflow versions with MANUAL trigger type found for workspace ${workspaceId}`,
      );

      return;
    }

    // In dry-run mode when object doesn't exist, we can only log what would be created
    if (!objectExists && options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${manualTriggerVersions.length} ManualTrigger records (all versions, cannot check for existing triggers)`,
      );

      for (const workflowVersion of manualTriggerVersions) {
        assertWorkflowVersionTriggerIsDefined(workflowVersion);

        this.logger.log(
          `[DRY RUN] Would create ManualTrigger for workflow version ${workflowVersion.id} (workflow ${workflowVersion.workflowId})`,
        );
      }

      return;
    }

    const manualTriggerRepository =
      await this.globalWorkspaceOrmManager.getRepository<ManualTriggerWorkspaceEntity>(
        workspaceId,
        'manualTrigger',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersionIds = manualTriggerVersions.map(
      (version) => version.id,
    );

    const existingManualTriggers = await manualTriggerRepository.find({
      where: {
        workflowVersionId: In(workflowVersionIds),
      },
      select: ['workflowVersionId'],
    });

    const existingWorkflowVersionIds = new Set(
      existingManualTriggers.map((trigger) => trigger.workflowVersionId),
    );

    const versionsToCreate = manualTriggerVersions.filter(
      (version) => !existingWorkflowVersionIds.has(version.id),
    );

    const skippedCount = manualTriggerVersions.length - versionsToCreate.length;

    if (skippedCount > 0) {
      this.logger.log(
        `Found ${skippedCount} workflow versions that already have ManualTrigger entities, skipping`,
      );
    }

    if (versionsToCreate.length === 0) {
      this.logger.log(
        `All workflow versions already have ManualTrigger entities for workspace ${workspaceId}`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${versionsToCreate.length} ManualTrigger records`,
      );

      for (const workflowVersion of versionsToCreate) {
        assertWorkflowVersionTriggerIsDefined(workflowVersion);

        this.logger.log(
          `[DRY RUN] Would create ManualTrigger for workflow version ${workflowVersion.id} (workflow ${workflowVersion.workflowId})`,
        );
      }

      return;
    }

    const manualTriggersToInsert = versionsToCreate.map((workflowVersion) => {
      assertWorkflowVersionTriggerIsDefined(workflowVersion);

      if (workflowVersion.trigger.type !== WorkflowTriggerType.MANUAL) {
        throw new Error(
          `Expected MANUAL trigger type for workflow version ${workflowVersion.id}`,
        );
      }

      const label = workflowVersion.workflow?.name;

      if (!isDefined(label)) {
        throw new Error(
          `Workflow name not found for workflow version ${workflowVersion.id}`,
        );
      }

      const settings = workflowVersion.trigger.settings;
      const availability = settings.availability;
      const availabilityType = availability?.type as
        | ManualTriggerAvailabilityType
        | undefined;

      const availabilityObjectNameSingular =
        availability &&
        (availability.type === ManualTriggerAvailabilityType.SINGLE_RECORD ||
          availability.type === ManualTriggerAvailabilityType.BULK_RECORDS)
          ? availability.objectNameSingular
          : null;

      return {
        workflowId: workflowVersion.workflowId,
        workflowVersionId: workflowVersion.id,
        label,
        icon: settings.icon,
        isPinned: settings.isPinned,
        availabilityType,
        availabilityObjectNameSingular,
      };
    });

    await manualTriggerRepository.insert(manualTriggersToInsert);

    this.logger.log(
      `Successfully backfilled ${manualTriggersToInsert.length} ManualTrigger records, ${skippedCount} skipped`,
    );
  }
}
