import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

import { msg } from '@lingui/core/macro';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { buildCoreDispatchIds } from 'src/engine/core-modules/workflow/utils/build-core-dispatch-ids.util';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.workspace-service';
import { CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import {
  type WorkflowManualTrigger,
  WorkflowTriggerType,
  type WorkflowTrigger,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { assertPickRecordLoadBalanceConfigIsValid } from 'src/modules/workflow/workflow-trigger/utils/assert-pick-record-load-balance-config-is-valid.util';
import { assertVersionCanBeActivated } from 'src/modules/workflow/workflow-trigger/utils/assert-version-can-be-activated.util';
import { computeCronPatternFromSchedule } from 'src/modules/workflow/workflow-trigger/utils/compute-cron-pattern-from-schedule';
import { getWorkflowCommandMenuItemLabel } from 'src/modules/workflow/workflow-trigger/utils/get-workflow-command-menu-item-label.util';

type ResolvedCoreVersion = {
  coreWorkflowVersion: WorkflowVersionEntity;
  coreWorkflow: WorkflowEntity;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
};

@Injectable()
export class CoreWorkflowLifecycleWorkspaceService {
  private readonly logger = new Logger(
    CoreWorkflowLifecycleWorkspaceService.name,
  );

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly coreWorkflowIdResolutionService: CoreWorkflowIdResolutionService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowVersionValidationWorkspaceService: WorkflowVersionValidationWorkspaceService,
    private readonly codeStepBuildService: CodeStepBuildService,
    private readonly commandMenuItemService: CommandMenuItemService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async validateCoreWorkflowVersion({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId: string;
  }): Promise<boolean> {
    // Reads the version from the repository, not the id resolver, so the rule is applied by hand.
    await this.coreWorkflowAccessService.assertCoreWorkflowVersionsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        coreWorkflowVersionIds: [coreWorkflowVersionId],
      },
    );

    const coreWorkflowVersion =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: { id: coreWorkflowVersionId },
      });

    if (!isDefined(coreWorkflowVersion)) {
      throw new WorkflowTriggerException(
        `Core workflow version '${coreWorkflowVersionId}' not found`,
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
        {
          userFriendlyMessage: msg`Workflow version not found`,
        },
      );
    }

    await this.workflowVersionValidationWorkspaceService.assertWorkflowVersionIsActivableOrThrow(
      {
        workspaceId,
        trigger: coreWorkflowVersion.triggers?.[0] ?? null,
        steps: coreWorkflowVersion.steps,
      },
    );

    return true;
  }

  async activateCoreWorkflowVersion({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId: string;
  }): Promise<boolean> {
    const resolved = await this.resolveCoreVersionWithWorkflowOrThrow({
      workspaceId,
      userWorkspaceId,
      coreWorkflowVersionId,
    });

    const { coreWorkflowVersion, coreWorkflow, trigger, steps } = resolved;

    await this.workflowVersionValidationWorkspaceService.assertWorkflowVersionIsActivableOrThrow(
      {
        workspaceId,
        trigger,
        steps,
      },
    );

    const isLastPublishedVersion =
      coreWorkflow.lastPublishedCoreWorkflowVersionId ===
      coreWorkflowVersion.id;

    assertVersionCanBeActivated(
      {
        id: coreWorkflowVersion.id,
        status: coreWorkflowVersion.status,
        trigger,
        steps,
      },
      {
        lastPublishedVersionId: isLastPublishedVersion
          ? coreWorkflowVersion.id
          : null,
      },
    );

    const { objectIdByNameSingular, flatFieldMetadataMaps } =
      await this.workflowCommonWorkspaceService.getFlatEntityMaps(workspaceId);

    assertPickRecordLoadBalanceConfigIsValid({
      steps: steps ?? [],
      objectIdByNameSingular,
      flatFieldMetadataMaps,
    });

    await this.codeStepBuildService.buildCodeStepsFromSourceForSteps({
      workspaceId,
      steps: steps ?? [],
    });

    await this.codeStepBuildService.switchCodeStepLogicFunctionsToPrebuilt({
      workspaceId,
      steps: steps ?? [],
    });

    const previousCoreWorkflowVersionId =
      await this.findPreviousCoreWorkflowVersionIdUnderLock({
        workspaceId,
        resolved,
      });

    const previousResolved = isDefined(previousCoreWorkflowVersionId)
      ? await this.resolveCoreVersionWithWorkflowOrThrow({
          workspaceId,
          userWorkspaceId,
          coreWorkflowVersionId: previousCoreWorkflowVersionId,
        })
      : undefined;

    const statusByCoreWorkflowVersionId = new Map<
      string,
      WorkflowVersionStatus
    >();

    if (isDefined(previousResolved)) {
      statusByCoreWorkflowVersionId.set(
        previousResolved.coreWorkflowVersion.id,
        WorkflowVersionStatus.ARCHIVED,
      );
    }

    statusByCoreWorkflowVersionId.set(
      coreWorkflowVersion.id,
      WorkflowVersionStatus.ACTIVE,
    );

    await this.applyCoreVersionStatuses({
      workspaceId,
      statusByCoreWorkflowVersionId,
      coreWorkflowUpdate: {
        coreWorkflowId: coreWorkflow.id,
        lastPublishedCoreWorkflowVersionId: coreWorkflowVersion.id,
        lastPublishedVersionId:
          coreWorkflowVersion.workspaceWorkflowVersionId ?? null,
      },
    });

    if (isDefined(previousResolved)) {
      if (
        previousResolved.coreWorkflowVersion.status ===
        WorkflowVersionStatus.ACTIVE
      ) {
        await this.deleteCronTriggerCacheEntry(previousResolved);
      }

      await this.deleteCommandMenuItem({
        workspaceId,
        resolved: previousResolved,
      });
    }

    await this.writeCronTriggerCacheEntry({ resolved });

    await this.createOrUpdateCommandMenuItem({
      workspaceId,
      resolved,
    });

    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );

    return true;
  }

  async deactivateCoreWorkflowVersion({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId: string;
  }): Promise<boolean> {
    const resolved = await this.resolveCoreVersionWithWorkflowOrThrow({
      workspaceId,
      userWorkspaceId,
      coreWorkflowVersionId,
    });

    if (resolved.coreWorkflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
      return true;
    }

    await this.applyCoreVersionStatuses({
      workspaceId,
      statusByCoreWorkflowVersionId: new Map([
        [resolved.coreWorkflowVersion.id, WorkflowVersionStatus.DEACTIVATED],
      ]),
    });

    await this.deleteCronTriggerCacheEntry(resolved);

    await this.deleteCommandMenuItem({ workspaceId, resolved });

    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );

    return true;
  }

  private async resolveCoreVersionWithWorkflowOrThrow({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId: string;
  }): Promise<ResolvedCoreVersion> {
    const coreWorkflowVersion =
      await this.coreWorkflowIdResolutionService.resolveCoreVersionOrThrow({
        workspaceId,
        userWorkspaceId,
        coreWorkflowVersionId,
      });

    if (!isDefined(coreWorkflowVersion.coreWorkflowId)) {
      throw new WorkflowTriggerException(
        `Core workflow version '${coreWorkflowVersionId}' is not linked to a core workflow`,
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
        {
          userFriendlyMessage: msg`Workflow version is not correctly linked, please retry later`,
        },
      );
    }

    const coreWorkflow =
      await this.coreWorkflowIdResolutionService.resolveCoreWorkflowOrThrow({
        workspaceId,
        userWorkspaceId,
        coreWorkflowId: coreWorkflowVersion.coreWorkflowId,
      });

    return {
      coreWorkflowVersion,
      coreWorkflow,
      trigger: coreWorkflowVersion.triggers?.[0] ?? null,
      steps: coreWorkflowVersion.steps,
    };
  }

  private async findPreviousCoreWorkflowVersionIdUnderLock({
    workspaceId,
    resolved: { coreWorkflow, coreWorkflowVersion },
  }: {
    workspaceId: string;
    resolved: ResolvedCoreVersion;
  }): Promise<string | null> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const [lockedCoreWorkflow] = await queryRunner.query(
        `SELECT "lastPublishedCoreWorkflowVersionId" FROM core."workflow"
           WHERE "id" = $1 AND "workspaceId" = $2 FOR NO KEY UPDATE`,
        [coreWorkflow.id, workspaceId],
      );

      const unchangedVersion = await queryRunner.query(
        `SELECT id FROM core."workflowVersion" WHERE id = $1 AND "workspaceId" = $2
         AND status = $3 AND triggers IS NOT DISTINCT FROM $4::jsonb AND steps IS NOT DISTINCT FROM $5::jsonb`,
        [
          coreWorkflowVersion.id,
          workspaceId,
          coreWorkflowVersion.status,
          JSON.stringify(coreWorkflowVersion.triggers),
          JSON.stringify(coreWorkflowVersion.steps),
        ],
      );

      if (unchangedVersion.length !== 1) {
        throw new WorkflowTriggerException(
          'Workflow version changed during activation',
          WorkflowTriggerExceptionCode.INVALID_INPUT,
          {
            userFriendlyMessage: msg`Workflow version changed, please reload and retry`,
          },
        );
      }

      const activeVersions = await queryRunner.query(
        `SELECT id FROM core."workflowVersion" WHERE "coreWorkflowId" = $1 AND "workspaceId" = $2 AND status = 'ACTIVE'`,
        [coreWorkflow.id, workspaceId],
      );

      if (
        activeVersions.length > 1 ||
        activeVersions[0]?.id === coreWorkflowVersion.id
      ) {
        throw new WorkflowTriggerException(
          'Cannot have more than one active workflow version',
          WorkflowTriggerExceptionCode.FORBIDDEN,
          {
            userFriendlyMessage: msg`Cannot have more than one active workflow version`,
          },
        );
      }

      await queryRunner.commitTransaction();

      if (typeof activeVersions[0]?.id === 'string') {
        return activeVersions[0].id;
      }

      return typeof lockedCoreWorkflow?.lastPublishedCoreWorkflowVersionId ===
        'string' &&
        lockedCoreWorkflow.lastPublishedCoreWorkflowVersionId !==
          coreWorkflowVersion.id
        ? lockedCoreWorkflow.lastPublishedCoreWorkflowVersionId
        : null;
    } finally {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      await queryRunner.release();
    }
  }

  private async applyCoreVersionStatuses({
    workspaceId,
    statusByCoreWorkflowVersionId,
    coreWorkflowUpdate,
  }: {
    workspaceId: string;
    statusByCoreWorkflowVersionId: Map<string, WorkflowVersionStatus>;
    coreWorkflowUpdate?: {
      coreWorkflowId: string;
      lastPublishedCoreWorkflowVersionId: string | null;
      lastPublishedVersionId: string | null;
    };
  }): Promise<void> {
    if (
      statusByCoreWorkflowVersionId.size === 0 &&
      !isDefined(coreWorkflowUpdate)
    ) {
      return;
    }

    const { flatWorkflowVersionMaps, flatWorkflowMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatWorkflowVersionMaps', 'flatWorkflowMaps'],
        },
      );

    const flatWorkflowVersionsToUpdate = [
      ...statusByCoreWorkflowVersionId.entries(),
    ].map(([coreWorkflowVersionId, status]) => ({
      ...findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: coreWorkflowVersionId,
        flatEntityMaps: flatWorkflowVersionMaps,
      }),
      status,
    }));

    const flatWorkflowsToUpdate = isDefined(coreWorkflowUpdate)
      ? [
          {
            ...findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityId: coreWorkflowUpdate.coreWorkflowId,
              flatEntityMaps: flatWorkflowMaps,
            }),
            lastPublishedCoreWorkflowVersionId:
              coreWorkflowUpdate.lastPublishedCoreWorkflowVersionId,
            lastPublishedVersionId: coreWorkflowUpdate.lastPublishedVersionId,
          },
        ]
      : [];

    await this.runCoreWorkflowMigration({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while writing workflow version status',
      operations: {
        ...(flatWorkflowVersionsToUpdate.length > 0
          ? {
              workflowVersion: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: flatWorkflowVersionsToUpdate,
              },
            }
          : {}),
        ...(flatWorkflowsToUpdate.length > 0
          ? {
              workflow: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: flatWorkflowsToUpdate,
              },
            }
          : {}),
      },
    });
  }

  private async runCoreWorkflowMigration({
    workspaceId,
    failureMessage,
    operations,
  }: {
    workspaceId: string;
    failureMessage: string;
    operations: AllFlatEntityOperationByMetadataName;
  }): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: operations,
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        failureMessage,
      );
    }
  }

  private async writeCronTriggerCacheEntry({
    resolved,
  }: {
    resolved: ResolvedCoreVersion;
  }): Promise<void> {
    const { trigger } = resolved;

    if (!isDefined(trigger) || trigger.type !== WorkflowTriggerType.CRON) {
      return;
    }

    const cachedTrigger: CachedCronTrigger = {
      workspaceId: resolved.coreWorkflowVersion.workspaceId,
      workflowId: resolved.coreWorkflow.id,
      legacyWorkflowId: resolved.coreWorkflow.workspaceWorkflowId ?? undefined,
      pattern: computeCronPatternFromSchedule(trigger),
      ...buildCoreDispatchIds({
        coreWorkflowVersionId: resolved.coreWorkflowVersion.id,
        workspaceWorkflowVersionId:
          resolved.coreWorkflowVersion.workspaceWorkflowVersionId,
      }),
    };

    try {
      await this.cacheStorageService.hashSetIfExists({
        key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
        field: resolved.coreWorkflow.id,
        value: JSON.stringify(cachedTrigger),
      });
    } catch (error) {
      this.logger.error(
        `Cron trigger cache entry not published for workflow ${resolved.coreWorkflow.id}, dropping the cron cache so the next tick rebuilds it from the database`,
        error,
      );

      try {
        await this.cacheStorageService.del(WORKFLOW_CRON_TRIGGER_CACHE_KEY);
      } catch (invalidationError) {
        this.logger.error(invalidationError);
      }
    }
  }

  private async deleteCronTriggerCacheEntry({
    trigger,
    coreWorkflow,
  }: ResolvedCoreVersion): Promise<void> {
    if (!isDefined(trigger) || trigger.type !== WorkflowTriggerType.CRON) {
      return;
    }

    await this.cacheStorageService.hashDelete({
      key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
      field: coreWorkflow.id,
    });
  }

  private async createOrUpdateCommandMenuItem({
    workspaceId,
    resolved,
  }: {
    workspaceId: string;
    resolved: ResolvedCoreVersion;
  }): Promise<void> {
    const { trigger } = resolved;

    if (!isDefined(trigger) || trigger.type !== WorkflowTriggerType.MANUAL) {
      return;
    }

    const { availabilityType, availabilityObjectMetadataId } =
      await this.resolveManualTriggerAvailability({ trigger, workspaceId });

    const label = getWorkflowCommandMenuItemLabel({
      name: resolved.coreWorkflow.name,
    });

    const existingCommandMenuItem = await this.findCommandMenuItem({
      workspaceId,
      resolved,
    });

    if (isDefined(existingCommandMenuItem)) {
      await this.commandMenuItemService.update(
        {
          id: existingCommandMenuItem.id,
          label,
          shortLabel: label,
          icon: trigger.settings.icon,
          isPinned: trigger.settings.isPinned,
          availabilityType,
          availabilityObjectMetadataId,
        },
        workspaceId,
      );
    } else {
      await this.commandMenuItemService.create(
        {
          workflowVersionId:
            resolved.coreWorkflowVersion.workspaceWorkflowVersionId ??
            undefined,
          coreWorkflowVersionId: resolved.coreWorkflowVersion.id,
          engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
          label,
          shortLabel: label,
          icon: trigger.settings.icon,
          isPinned: trigger.settings.isPinned,
          availabilityType,
          availabilityObjectMetadataId,
        },
        workspaceId,
      );
    }
  }

  private async deleteCommandMenuItem({
    workspaceId,
    resolved,
  }: {
    workspaceId: string;
    resolved: ResolvedCoreVersion;
  }): Promise<void> {
    const { trigger } = resolved;

    if (!isDefined(trigger) || trigger.type !== WorkflowTriggerType.MANUAL) {
      return;
    }

    const existingCommandMenuItem = await this.findCommandMenuItem({
      workspaceId,
      resolved,
    });

    if (isDefined(existingCommandMenuItem)) {
      await this.commandMenuItemService.delete(
        existingCommandMenuItem.id,
        workspaceId,
      );
    }
  }

  private async findCommandMenuItem({
    workspaceId,
    resolved: { coreWorkflowVersion },
  }: {
    workspaceId: string;
    resolved: ResolvedCoreVersion;
  }) {
    const commandMenuItem =
      await this.commandMenuItemService.findByCoreWorkflowVersionId(
        coreWorkflowVersion.id,
        workspaceId,
      );

    if (
      isDefined(commandMenuItem) ||
      !isDefined(coreWorkflowVersion.workspaceWorkflowVersionId)
    ) {
      return commandMenuItem;
    }

    return this.commandMenuItemService.findByWorkflowVersionId(
      coreWorkflowVersion.workspaceWorkflowVersionId,
      workspaceId,
    );
  }

  private async resolveManualTriggerAvailability({
    trigger,
    workspaceId,
  }: {
    trigger: WorkflowManualTrigger;
    workspaceId: string;
  }): Promise<{
    availabilityType: CommandMenuItemAvailabilityType;
    availabilityObjectMetadataId: string | undefined;
  }> {
    const availability = trigger.settings.availability;

    let availabilityType = CommandMenuItemAvailabilityType.GLOBAL;
    let availabilityObjectMetadataId: string | undefined;

    if (isDefined(availability)) {
      switch (availability.type) {
        case 'GLOBAL':
          availabilityType = CommandMenuItemAvailabilityType.GLOBAL;
          break;
        case 'SINGLE_RECORD':
        case 'BULK_RECORDS': {
          availabilityType = CommandMenuItemAvailabilityType.RECORD_SELECTION;

          const { objectIdByNameSingular } =
            await this.workflowCommonWorkspaceService.getFlatEntityMaps(
              workspaceId,
            );

          const objectId =
            objectIdByNameSingular[availability.objectNameSingular];

          if (!isDefined(objectId)) {
            throw new WorkflowTriggerException(
              `Object metadata not found for object: ${availability.objectNameSingular}`,
              WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
            );
          }

          availabilityObjectMetadataId = objectId;
          break;
        }
      }
    }

    return { availabilityType, availabilityObjectMetadataId };
  }
}
