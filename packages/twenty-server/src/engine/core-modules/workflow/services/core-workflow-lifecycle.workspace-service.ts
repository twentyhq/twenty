import { Injectable } from '@nestjs/common';
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

import {
  WorkflowVersionEntity,
  WorkflowVersionStatus as CoreWorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { CoreWorkflowTriggerService } from 'src/engine/core-modules/workflow/services/core-workflow-trigger.service';
import { buildCoreWorkflowNotFoundException } from 'src/engine/core-modules/workflow/utils/build-core-workflow-not-found-exception.util';
import { buildCronTriggerCacheEntry } from 'src/engine/core-modules/workflow/utils/build-cron-trigger-cache-entry.util';
import { getCoreWorkflowVersionEditLockKey } from 'src/engine/core-modules/workflow/utils/get-core-workflow-version-edit-lock-key.util';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
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
import { getWorkflowCommandMenuItemLabel } from 'src/modules/workflow/workflow-trigger/utils/get-workflow-command-menu-item-label.util';

type ResolvedCoreVersion = {
  coreWorkflowVersion: WorkflowVersionEntity;
  coreWorkflow: WorkflowEntity;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
};

type CommandMenuItemOperations = {
  flatEntityToCreate: FlatCommandMenuItem[];
  flatEntityToDelete: FlatCommandMenuItem[];
  flatEntityToUpdate: FlatCommandMenuItem[];
};

@Injectable()
export class CoreWorkflowLifecycleWorkspaceService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly postgresAdvisoryLockService: PostgresAdvisoryLockService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
    private readonly coreWorkflowTriggerService: CoreWorkflowTriggerService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowVersionValidationWorkspaceService: WorkflowVersionValidationWorkspaceService,
    private readonly commandMenuItemService: CommandMenuItemService,
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
    const coreWorkflowVersion =
      await this.coreWorkflowAccessService.findReadableCoreWorkflowVersion({
        workspaceId,
        userWorkspaceId,
        coreWorkflowVersionId,
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

    assertVersionCanBeActivated({
      workflowVersion: {
        id: coreWorkflowVersion.id,
        status: coreWorkflowVersion.status,
        trigger,
        steps,
      },
      isLastPublishedVersion:
        coreWorkflow.lastPublishedCoreWorkflowVersionId ===
        coreWorkflowVersion.id,
    });

    const { objectIdByNameSingular, flatFieldMetadataMaps } =
      await this.workflowCommonWorkspaceService.getFlatEntityMaps(workspaceId);

    assertPickRecordLoadBalanceConfigIsValid({
      steps: steps ?? [],
      objectIdByNameSingular,
      flatFieldMetadataMaps,
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
          },
          commandMenuItemOperations: await this.buildCommandMenuItemOperations({
            workspaceId,
            unpublished: previous,
            published: resolved,
          }),
        });

        const cronTriggerToPublish = buildCronTriggerCacheEntry(resolved);
        const isPreviousCronUnscheduled =
          !isDefined(cronTriggerToPublish) &&
          previous?.coreWorkflowVersion.status ===
            CoreWorkflowVersionStatus.ACTIVE &&
          previous.trigger?.type === WorkflowTriggerType.CRON;

        await this.coreWorkflowTriggerService.refreshTriggerCachesAfterCommit({
          workspaceId,
          cronTriggersToPublish: isDefined(cronTriggerToPublish)
            ? [cronTriggerToPublish]
            : [],
          coreWorkflowIdsToUnschedule: isPreviousCronUnscheduled
            ? [coreWorkflow.id]
            : [],
        });
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
          commandMenuItemOperations: await this.buildCommandMenuItemOperations({
            workspaceId,
            unpublished: resolved,
          }),
        });

        await this.coreWorkflowTriggerService.refreshTriggerCachesAfterCommit({
          workspaceId,
          coreWorkflowIdsToUnschedule:
            resolved.trigger?.type === WorkflowTriggerType.CRON
              ? [resolved.coreWorkflow.id]
              : [],
        });
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
    const { coreWorkflowVersion, coreWorkflow } =
      await this.coreWorkflowAccessService.findEditableCoreWorkflowVersionOrThrow(
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

    if (!isDefined(coreWorkflow)) {
      throw buildCoreWorkflowNotFoundException(
        coreWorkflowVersion.coreWorkflowId,
      );
    }

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
    commandMenuItemOperations,
  }: {
    workspaceId: string;
    statusByCoreWorkflowVersionId: Map<string, CoreWorkflowVersionStatus>;
    coreWorkflowUpdate?: {
      coreWorkflowId: string;
      lastPublishedCoreWorkflowVersionId: string | null;
    };
    commandMenuItemOperations: CommandMenuItemOperations;
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
        commandMenuItem: commandMenuItemOperations,
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

  private async buildCommandMenuItemOperations({
    workspaceId,
    unpublished,
    published,
  }: {
    workspaceId: string;
    unpublished?: ResolvedCoreVersion;
    published?: ResolvedCoreVersion;
  }): Promise<CommandMenuItemOperations> {
    const operations: CommandMenuItemOperations = {
      flatEntityToCreate: [],
      flatEntityToDelete: [],
      flatEntityToUpdate: [],
    };

    if (unpublished?.trigger?.type === WorkflowTriggerType.MANUAL) {
      const existingCommandMenuItem =
        await this.commandMenuItemService.findByCoreWorkflowVersionId(
          unpublished.coreWorkflowVersion.id,
          workspaceId,
        );

      if (isDefined(existingCommandMenuItem)) {
        const { flatCommandMenuItemToDelete, flatCommandMenuItemToDeactivate } =
          await this.commandMenuItemService.computeFlatCommandMenuItemDeletion({
            id: existingCommandMenuItem.id,
            workspaceId,
          });

        if (isDefined(flatCommandMenuItemToDeactivate)) {
          operations.flatEntityToUpdate.push(flatCommandMenuItemToDeactivate);
        } else {
          operations.flatEntityToDelete.push(flatCommandMenuItemToDelete);
        }
      }
    }

    const trigger = published?.trigger;

    if (!isDefined(published) || trigger?.type !== WorkflowTriggerType.MANUAL) {
      return operations;
    }

    const { availabilityType, availabilityObjectMetadataId } =
      await this.resolveManualTriggerAvailability({ trigger, workspaceId });

    const label = getWorkflowCommandMenuItemLabel({
      name: published.coreWorkflow.name,
    });

    const commandMenuItemProperties = {
      label,
      shortLabel: label,
      icon: trigger.settings.icon,
      isPinned: trigger.settings.isPinned,
      availabilityType,
      availabilityObjectMetadataId,
    };

    const existingCommandMenuItem =
      await this.commandMenuItemService.findByCoreWorkflowVersionId(
        published.coreWorkflowVersion.id,
        workspaceId,
      );

    if (!isDefined(existingCommandMenuItem)) {
      operations.flatEntityToCreate.push(
        await this.commandMenuItemService.computeFlatCommandMenuItemToCreate({
          input: {
            ...commandMenuItemProperties,
            coreWorkflowVersionId: published.coreWorkflowVersion.id,
            engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
          },
          workspaceId,
        }),
      );

      return operations;
    }

    const updatedFlatCommandMenuItem =
      await this.commandMenuItemService.computeFlatCommandMenuItemToUpdate({
        input: { ...commandMenuItemProperties, id: existingCommandMenuItem.id },
        workspaceId,
      });

    if (existingCommandMenuItem.isActive) {
      operations.flatEntityToUpdate.push(updatedFlatCommandMenuItem);

      return operations;
    }

    const activatedFlatCommandMenuItem =
      await this.commandMenuItemService.computeActivatedFlatCommandMenuItem({
        flatCommandMenuItem: updatedFlatCommandMenuItem,
        workspaceId,
      });

    operations.flatEntityToUpdate.push(activatedFlatCommandMenuItem);

    return operations;
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
