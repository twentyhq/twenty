import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import {
  CommandMenuItemAvailabilityType,
  type ActorMetadata,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus as CoreWorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { assertExactlyOneMirrorRowWasWritten } from 'src/engine/core-modules/workflow/utils/assert-exactly-one-mirror-row-was-written.util';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { buildCoreDispatchIds } from 'src/engine/core-modules/workflow/utils/build-core-dispatch-ids.util';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.workspace-service';
import { CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { WORKFLOW_VERSION_STATUS_UPDATED } from 'src/modules/workflow/workflow-status/constants/workflow-version-status-updated.constants';
import { type WorkflowVersionStatusUpdate } from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';
import { AutomatedTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.workspace-service';
import { type DatabaseEventTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
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
import { assertNever } from 'src/utils/assert';

type ResolvedCoreVersion = {
  coreWorkflowVersion: WorkflowVersionEntity;
  coreWorkflow: WorkflowEntity;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
  workspaceWorkflowVersionId: string;
  workspaceWorkflowId: string;
};

@Injectable()
export class CoreWorkflowLifecycleWorkspaceService {
  private readonly logger = new Logger(
    CoreWorkflowLifecycleWorkspaceService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly coreWorkflowIdResolutionService: CoreWorkflowIdResolutionService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowVersionValidationWorkspaceService: WorkflowVersionValidationWorkspaceService,
    private readonly codeStepBuildService: CodeStepBuildService,
    private readonly automatedTriggerWorkspaceService: AutomatedTriggerWorkspaceService,
    private readonly commandMenuItemService: CommandMenuItemService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async validateCoreWorkflowVersion({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<boolean> {
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
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<boolean> {
    const resolved = await this.resolveCoreVersionWithWorkflowOrThrow({
      workspaceId,
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
      coreWorkflow.lastPublishedVersionId ===
        resolved.workspaceWorkflowVersionId;

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

    const currentlyActiveCoreVersion =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: {
          coreWorkflowId: coreWorkflow.id,
          status: CoreWorkflowVersionStatus.ACTIVE,
        },
      });

    const previousPublishedCoreVersionId =
      currentlyActiveCoreVersion?.id ?? null;

    if (
      isDefined(previousPublishedCoreVersionId) &&
      previousPublishedCoreVersionId !== coreWorkflowVersion.id
    ) {
      await this.deactivateCoreWorkflowVersion({
        workspaceId,
        coreWorkflowVersionId: previousPublishedCoreVersionId,
      });
    }

    const activeSiblingsCount = await this.coreWorkflowVersionRepository.count(
      workspaceId,
      {
        where: {
          coreWorkflowId: coreWorkflow.id,
          status: CoreWorkflowVersionStatus.ACTIVE,
        },
      },
    );

    if (activeSiblingsCount > 0) {
      throw new WorkflowTriggerException(
        'Cannot have more than one active workflow version',
        WorkflowTriggerExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Cannot have more than one active workflow version`,
        },
      );
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          if (
            isDefined(previousPublishedCoreVersionId) &&
            previousPublishedCoreVersionId !== coreWorkflowVersion.id
          ) {
            await this.writeVersionStatusInTransaction({
              transactionScope,
              workspaceId,
              coreWorkflowVersionId: previousPublishedCoreVersionId,
              status: WorkflowVersionStatus.ARCHIVED,
            });
          }

          if (
            coreWorkflow.lastPublishedCoreWorkflowVersionId !==
            coreWorkflowVersion.id
          ) {
            await transactionScope.executeRawQuery(
              `UPDATE core."workflow"
               SET "lastPublishedCoreWorkflowVersionId" = $3, "lastPublishedVersionId" = $4, "updatedAt" = now()
               WHERE "id" = $1 AND "workspaceId" = $2`,
              [
                coreWorkflow.id,
                workspaceId,
                coreWorkflowVersion.id,
                resolved.workspaceWorkflowVersionId,
              ],
            );

            await transactionScope
              .getRepository<WorkflowWorkspaceEntity>('workflow', {
                shouldBypassPermissionChecks: true,
              })
              .update(
                { id: resolved.workspaceWorkflowId },
                {
                  lastPublishedVersionId: resolved.workspaceWorkflowVersionId,
                },
              );
          }

          await this.writeVersionStatusInTransaction({
            transactionScope,
            workspaceId,
            coreWorkflowVersionId: coreWorkflowVersion.id,
            status: WorkflowVersionStatus.ACTIVE,
          });

          await this.enableAutomatedTrigger({
            resolved,
            transactionScope,
          });
        },
      );
    }, buildSystemAuthContext(workspaceId));

    await this.writeCronTriggerCacheEntryAfterCommit({ resolved });

    await this.createOrUpdateCommandMenuItem({
      workspaceId,
      resolved,
    });

    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );

    this.emitStatusUpdateEvent({
      workspaceId,
      resolved,
      newStatus: WorkflowVersionStatus.ACTIVE,
    });

    return true;
  }

  async deactivateCoreWorkflowVersion({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<boolean> {
    const resolved = await this.resolveCoreVersionWithWorkflowOrThrow({
      workspaceId,
      coreWorkflowVersionId,
    });

    if (
      resolved.coreWorkflowVersion.status !== CoreWorkflowVersionStatus.ACTIVE
    ) {
      return true;
    }

    await this.deleteCommandMenuItem({ workspaceId, resolved });

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          await this.writeVersionStatusInTransaction({
            transactionScope,
            workspaceId,
            coreWorkflowVersionId: resolved.coreWorkflowVersion.id,
            status: WorkflowVersionStatus.DEACTIVATED,
          });

          await this.disableAutomatedTrigger({
            resolved,
            transactionScope,
          });
        },
      );
    }, buildSystemAuthContext(workspaceId));

    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );

    this.emitStatusUpdateEvent({
      workspaceId,
      resolved,
      newStatus: WorkflowVersionStatus.DEACTIVATED,
    });

    return true;
  }

  async runCoreWorkflowVersion({
    workspaceId,
    coreWorkflowVersionId,
    payload,
    createdBy,
    workflowRunId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    payload: object;
    createdBy: ActorMetadata;
    workflowRunId?: string;
  }): Promise<{ workflowRunId: string }> {
    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    return this.workflowRunnerWorkspaceService.run({
      workspaceId,
      workflowRunId,
      workflowVersionId: workspaceWorkflowVersionId,
      payload,
      source: createdBy,
    });
  }

  private async resolveCoreVersionWithWorkflowOrThrow({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<ResolvedCoreVersion> {
    const { coreWorkflowVersion, workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
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

    const { coreWorkflow, workspaceWorkflowId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceWorkflowIdOrThrow(
        { workspaceId, coreWorkflowId: coreWorkflowVersion.coreWorkflowId },
      );

    return {
      coreWorkflowVersion,
      coreWorkflow,
      trigger: coreWorkflowVersion.triggers?.[0] ?? null,
      steps: coreWorkflowVersion.steps,
      workspaceWorkflowVersionId,
      workspaceWorkflowId,
    };
  }

  private async writeVersionStatusInTransaction({
    transactionScope,
    workspaceId,
    coreWorkflowVersionId,
    status,
  }: {
    transactionScope: WorkspaceTransactionScope;
    workspaceId: string;
    coreWorkflowVersionId: string;
    status: WorkflowVersionStatus;
  }): Promise<void> {
    await transactionScope.executeRawQuery(
      `UPDATE core."workflowVersion"
       SET "status" = $3, "updatedAt" = now()
       WHERE "id" = $1 AND "workspaceId" = $2`,
      [coreWorkflowVersionId, workspaceId, status],
    );

    const mirrorUpdateResult = await transactionScope
      .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
        shouldBypassPermissionChecks: true,
      })
      .update({ coreWorkflowVersionId }, { status });

    assertExactlyOneMirrorRowWasWritten({
      affected: mirrorUpdateResult.affected,
      coreWorkflowVersionId,
    });
  }

  private async enableAutomatedTrigger({
    resolved,
    transactionScope,
  }: {
    resolved: ResolvedCoreVersion;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    const { trigger, workspaceWorkflowId } = resolved;
    const workspaceId = resolved.coreWorkflowVersion.workspaceId;

    if (!isDefined(trigger)) {
      return;
    }

    switch (trigger.type) {
      case WorkflowTriggerType.MANUAL:
      case WorkflowTriggerType.WEBHOOK:
        return;
      case WorkflowTriggerType.DATABASE_EVENT: {
        await this.automatedTriggerWorkspaceService.addAutomatedTrigger({
          workflowId: workspaceWorkflowId,
          type: AutomatedTriggerType.DATABASE_EVENT,
          settings: trigger.settings as DatabaseEventTriggerSettings,
          workspaceId,
          transactionScope,
        });

        return;
      }
      case WorkflowTriggerType.CRON: {
        const pattern = computeCronPatternFromSchedule(trigger);

        await this.automatedTriggerWorkspaceService.addAutomatedTrigger({
          workflowId: workspaceWorkflowId,
          type: AutomatedTriggerType.CRON,
          settings: { pattern },
          workspaceId,
          transactionScope,
        });

        return;
      }
      default:
        assertNever(trigger);
    }
  }

  private async writeCronTriggerCacheEntryAfterCommit({
    resolved,
  }: {
    resolved: ResolvedCoreVersion;
  }): Promise<void> {
    const { trigger, workspaceWorkflowId, workspaceWorkflowVersionId } =
      resolved;

    if (!isDefined(trigger) || trigger.type !== WorkflowTriggerType.CRON) {
      return;
    }

    const cachedTrigger: CachedCronTrigger = {
      workspaceId: resolved.coreWorkflowVersion.workspaceId,
      workflowId: workspaceWorkflowId,
      pattern: computeCronPatternFromSchedule(trigger),
      ...buildCoreDispatchIds({
        coreWorkflowVersionId: resolved.coreWorkflowVersion.id,
        workspaceWorkflowVersionId,
      }),
    };

    try {
      await this.cacheStorageService.hashSetIfExists({
        key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
        field: workspaceWorkflowId,
        value: JSON.stringify(cachedTrigger),
      });
    } catch (error) {
      this.logger.error(
        `Cron trigger cache entry not published for workflow ${workspaceWorkflowId}, dropping the cron cache so the next tick rebuilds it from the database`,
        error,
      );

      try {
        await this.cacheStorageService.del(WORKFLOW_CRON_TRIGGER_CACHE_KEY);
      } catch (invalidationError) {
        this.logger.error(invalidationError);
      }
    }
  }

  private async disableAutomatedTrigger({
    resolved,
    transactionScope,
  }: {
    resolved: ResolvedCoreVersion;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    const { trigger, workspaceWorkflowId } = resolved;
    const workspaceId = resolved.coreWorkflowVersion.workspaceId;

    if (!isDefined(trigger)) {
      return;
    }

    switch (trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
        await this.automatedTriggerWorkspaceService.deleteAutomatedTrigger({
          workflowId: workspaceWorkflowId,
          workspaceId,
          transactionScope,
        });

        return;
      case WorkflowTriggerType.CRON:
        await this.automatedTriggerWorkspaceService.deleteAutomatedTrigger({
          workflowId: workspaceWorkflowId,
          workspaceId,
          transactionScope,
        });

        await this.cacheStorageService.hashDelete({
          key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
          field: workspaceWorkflowId,
        });

        return;
      case WorkflowTriggerType.MANUAL:
      case WorkflowTriggerType.WEBHOOK:
        return;
      default:
        assertNever(trigger);
    }
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

    const existingCommandMenuItem =
      await this.commandMenuItemService.findByWorkflowVersionId(
        resolved.workspaceWorkflowVersionId,
        workspaceId,
      );

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
          workflowVersionId: resolved.workspaceWorkflowVersionId,
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

    const existingCommandMenuItem =
      await this.commandMenuItemService.findByWorkflowVersionId(
        resolved.workspaceWorkflowVersionId,
        workspaceId,
      );

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

  private emitStatusUpdateEvent({
    workspaceId,
    resolved,
    newStatus,
  }: {
    workspaceId: string;
    resolved: ResolvedCoreVersion;
    newStatus: WorkflowVersionStatus;
  }): void {
    this.workspaceEventEmitter.emitCustomBatchEvent<WorkflowVersionStatusUpdate>(
      WORKFLOW_VERSION_STATUS_UPDATED,
      [
        {
          workflowId: resolved.workspaceWorkflowId,
          workflowVersionId: resolved.workspaceWorkflowVersionId,
          previousStatus: this.toWorkspaceVersionStatus(
            resolved.coreWorkflowVersion.status,
          ),
          newStatus,
        },
      ],
      workspaceId,
    );
  }
}
