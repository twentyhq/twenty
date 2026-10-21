import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
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
  WorkflowVersionStatus as CoreWorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { buildCoreDispatchIds } from 'src/engine/core-modules/workflow/utils/build-core-dispatch-ids.util';
import { getCoreWorkflowVersionEditLockKey } from 'src/engine/core-modules/workflow/utils/get-core-workflow-version-edit-lock-key.util';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.workspace-service';
import { CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';
import { publishCronTriggerCacheEntry } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/utils/publish-cron-trigger-cache-entry.util';
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
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
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
        coreWorkflowVersion.id ||
      (isDefined(coreWorkflowVersion.workspaceWorkflowVersionId) &&
        coreWorkflow.lastPublishedVersionId ===
          coreWorkflowVersion.workspaceWorkflowVersionId);

    assertVersionCanBeActivated(
      {
        id: coreWorkflowVersion.id,
        status: this.toWorkspaceVersionStatus(coreWorkflowVersion.status),
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

    await this.withCoreWorkflowLifecycleLock({
      coreWorkflowId: coreWorkflow.id,
      coreWorkflowVersionId: coreWorkflowVersion.id,
      run: async () => {
        const unchangedVersion = await this.coreDataSource.query(
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

        const [lockedCoreWorkflow] = await this.coreDataSource.query(
          `SELECT "lastPublishedCoreWorkflowVersionId" FROM core."workflow"
             WHERE "id" = $1 AND "workspaceId" = $2`,
          [coreWorkflow.id, workspaceId],
        );

        const activeVersions = await this.coreDataSource.query(
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

        const previousCoreWorkflowVersionId =
          typeof activeVersions[0]?.id === 'string'
            ? activeVersions[0].id
            : typeof lockedCoreWorkflow?.lastPublishedCoreWorkflowVersionId ===
                  'string' &&
                lockedCoreWorkflow.lastPublishedCoreWorkflowVersionId !==
                  coreWorkflowVersion.id
              ? lockedCoreWorkflow.lastPublishedCoreWorkflowVersionId
              : null;

        const previous = isDefined(previousCoreWorkflowVersionId)
          ? await this.resolveCoreVersionWithWorkflowOrThrow({
              workspaceId,
              userWorkspaceId,
              coreWorkflowVersionId: previousCoreWorkflowVersionId,
            })
          : undefined;

        const statusByCoreWorkflowVersionId = new Map<
          string,
          CoreWorkflowVersionStatus
        >();

        if (isDefined(previous)) {
          statusByCoreWorkflowVersionId.set(
            previous.coreWorkflowVersion.id,
            CoreWorkflowVersionStatus.ARCHIVED,
          );
        }

        statusByCoreWorkflowVersionId.set(
          coreWorkflowVersion.id,
          CoreWorkflowVersionStatus.ACTIVE,
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

        if (isDefined(previous)) {
          if (
            previous.coreWorkflowVersion.status ===
            CoreWorkflowVersionStatus.ACTIVE
          ) {
            await this.deleteCronTriggerCacheEntry(previous);
          }

          await this.deleteCommandMenuItem({
            workspaceId,
            resolved: previous,
          });
        }

        await this.writeCronTriggerCacheEntry(resolved);

        await this.createOrUpdateCommandMenuItem({
          workspaceId,
          resolved,
        });

        await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
          workspaceId,
        );
      },
    });

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

    if (
      resolved.coreWorkflowVersion.status !== CoreWorkflowVersionStatus.ACTIVE
    ) {
      return true;
    }

    await this.withCoreWorkflowLifecycleLock({
      coreWorkflowId: resolved.coreWorkflow.id,
      coreWorkflowVersionId: resolved.coreWorkflowVersion.id,
      run: async () => {
        const activeVersion = await this.coreDataSource.query(
          `SELECT id FROM core."workflowVersion" WHERE id = $1 AND "workspaceId" = $2 AND status = 'ACTIVE'`,
          [resolved.coreWorkflowVersion.id, workspaceId],
        );

        if (activeVersion.length !== 1) {
          return;
        }

        await this.applyCoreVersionStatuses({
          workspaceId,
          statusByCoreWorkflowVersionId: new Map([
            [
              resolved.coreWorkflowVersion.id,
              CoreWorkflowVersionStatus.DEACTIVATED,
            ],
          ]),
        });

        await this.deleteCronTriggerCacheEntry(resolved);

        await this.deleteCommandMenuItem({ workspaceId, resolved });

        await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
          workspaceId,
        );
      },
    });

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
      await this.coreWorkflowIdResolutionService.resolveCoreWorkflowVersionOrThrow(
        { workspaceId, userWorkspaceId, coreWorkflowVersionId },
      );

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

  private async withCoreWorkflowLifecycleLock<T>({
    coreWorkflowId,
    coreWorkflowVersionId,
    run,
  }: {
    coreWorkflowId: string;
    coreWorkflowVersionId: string;
    run: () => Promise<T>;
  }): Promise<T> {
    const buildLockBusyException = () =>
      new WorkflowTriggerException(
        `Core workflow '${coreWorkflowId}' is being updated concurrently`,
        WorkflowTriggerExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`Workflow is being updated, please retry`,
        },
      );

    const workflowLockResult =
      await this.postgresAdvisoryLockService.tryWithLock(
        `core-workflow-lifecycle-${coreWorkflowId}`,
        () =>
          this.postgresAdvisoryLockService.tryWithLock(
            getCoreWorkflowVersionEditLockKey(coreWorkflowVersionId),
            run,
          ),
      );

    if (!workflowLockResult.acquired) {
      throw buildLockBusyException();
    }

    const versionLockResult = workflowLockResult.value;

    if (!versionLockResult.acquired) {
      throw buildLockBusyException();
    }

    return versionLockResult.value;
  }

  private async applyCoreVersionStatuses({
    workspaceId,
    statusByCoreWorkflowVersionId,
    coreWorkflowUpdate,
  }: {
    workspaceId: string;
    statusByCoreWorkflowVersionId: Map<string, CoreWorkflowVersionStatus>;
    coreWorkflowUpdate?: {
      coreWorkflowId: string;
      lastPublishedCoreWorkflowVersionId: string | null;
      lastPublishedVersionId: string | null;
    };
  }): Promise<void> {
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
        workflowVersion: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: flatWorkflowVersionsToUpdate,
        },
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
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    failureMessage: string;
    operations: AllFlatEntityOperationByMetadataName;
    applicationUniversalIdentifier?: string;
  }): Promise<void> {
    const universalIdentifier =
      applicationUniversalIdentifier ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication.universalIdentifier;

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: operations,
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier: universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        failureMessage,
      );
    }
  }

  private async writeCronTriggerCacheEntry(
    resolved: ResolvedCoreVersion,
  ): Promise<void> {
    const { trigger, coreWorkflow, coreWorkflowVersion } = resolved;

    if (!isDefined(trigger) || trigger.type !== WorkflowTriggerType.CRON) {
      return;
    }

    const cachedTrigger: CachedCronTrigger = {
      workspaceId: coreWorkflowVersion.workspaceId,
      workflowId: coreWorkflow.id,
      ...(isDefined(coreWorkflow.workspaceWorkflowId)
        ? { legacyWorkflowId: coreWorkflow.workspaceWorkflowId }
        : {}),
      pattern: computeCronPatternFromSchedule(trigger),
      ...buildCoreDispatchIds({
        coreWorkflowVersionId: coreWorkflowVersion.id,
        workspaceWorkflowVersionId:
          coreWorkflowVersion.workspaceWorkflowVersionId,
      }),
    };

    await publishCronTriggerCacheEntry({
      cacheStorageService: this.cacheStorageService,
      cachedTrigger,
      logger: this.logger,
    });
  }

  private async deleteCronTriggerCacheEntry(
    resolved: ResolvedCoreVersion,
  ): Promise<void> {
    if (resolved.trigger?.type !== WorkflowTriggerType.CRON) {
      return;
    }

    await this.cacheStorageService.hashDelete({
      key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
      field: resolved.coreWorkflow.id,
    });
  }

  private async findExistingCommandMenuItem({
    workspaceId,
    resolved,
  }: {
    workspaceId: string;
    resolved: ResolvedCoreVersion;
  }) {
    const commandMenuItem =
      await this.commandMenuItemService.findByCoreWorkflowVersionId(
        resolved.coreWorkflowVersion.id,
        workspaceId,
      );

    if (
      isDefined(commandMenuItem) ||
      !isDefined(resolved.coreWorkflowVersion.workspaceWorkflowVersionId)
    ) {
      return commandMenuItem;
    }

    return this.commandMenuItemService.findByWorkflowVersionId(
      resolved.coreWorkflowVersion.workspaceWorkflowVersionId,
      workspaceId,
    );
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

    const existingCommandMenuItem = await this.findExistingCommandMenuItem({
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
          ...(isDefined(resolved.coreWorkflowVersion.workspaceWorkflowVersionId)
            ? {
                workflowVersionId:
                  resolved.coreWorkflowVersion.workspaceWorkflowVersionId,
              }
            : {}),
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

    const existingCommandMenuItem = await this.findExistingCommandMenuItem({
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

  private toWorkspaceVersionStatus(
    status: CoreWorkflowVersionStatus,
  ): WorkflowVersionStatus {
    return WorkflowVersionStatus[status];
  }
}
