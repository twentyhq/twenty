import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus as CoreWorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CoreWorkflowMigrationWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-migration-write.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { assertExactlyOneMirrorRowWasWritten } from 'src/engine/core-modules/workflow/utils/assert-exactly-one-mirror-row-was-written.util';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { assertWorkflowVersionIsNotMalformedOrThrow } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/assert-workflow-version-is-not-malformed-or-throw.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export type ValidatedDraftCoreWorkflowVersion = {
  coreWorkflowVersion: WorkflowVersionEntity;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
};

@Injectable()
export class CoreWorkflowVersionWriteService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly coreWorkflowMigrationWriteService: CoreWorkflowMigrationWriteService,
    private readonly applicationService: ApplicationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  async getValidatedDraftCoreWorkflowVersion({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<ValidatedDraftCoreWorkflowVersion> {
    const coreWorkflowVersion =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: { id: coreWorkflowVersionId },
      });

    if (!isDefined(coreWorkflowVersion)) {
      throw new WorkflowQueryValidationException(
        `Core workflow version '${coreWorkflowVersionId}' not found`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version not found`,
        },
      );
    }

    if (coreWorkflowVersion.status !== CoreWorkflowVersionStatus.DRAFT) {
      throw new WorkflowQueryValidationException(
        `Core workflow version '${coreWorkflowVersionId}' is not a draft`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version is not a draft`,
        },
      );
    }

    return {
      coreWorkflowVersion,
      trigger: coreWorkflowVersion.triggers?.[0] ?? null,
      steps: coreWorkflowVersion.steps,
    };
  }

  async writeContentAndMirror({
    workspaceId,
    coreWorkflowVersionId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    trigger?: WorkflowTrigger | null;
    steps?: WorkflowAction[] | null;
  }): Promise<void> {
    if (trigger === undefined && steps === undefined) {
      return;
    }

    await this.assertContentIsNotMalformed({
      workspaceId,
      coreWorkflowVersionId,
      ...(await this.mergeWithPersistedContent({
        workspaceId,
        coreWorkflowVersionId,
        trigger,
        steps,
      })),
    });

    const setClauses: string[] = [];
    const parameters: (string | null)[] = [coreWorkflowVersionId, workspaceId];

    if (trigger !== undefined) {
      parameters.push(isDefined(trigger) ? JSON.stringify([trigger]) : null);
      setClauses.push(`"triggers" = $${parameters.length}`);
    }

    if (steps !== undefined) {
      parameters.push(isDefined(steps) ? JSON.stringify(steps) : null);
      setClauses.push(`"steps" = $${parameters.length}`);
    }

    const mirrorUpdatePayload: Pick<
      Partial<WorkflowVersionWorkspaceEntity>,
      'trigger' | 'steps'
    > = {
      ...(trigger === undefined ? {} : { trigger }),
      ...(steps === undefined ? {} : { steps }),
    };

    const { flatWorkflowVersionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowVersionMaps'] },
      );

    const flatWorkflowVersion = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: coreWorkflowVersionId,
      flatEntityMaps: flatWorkflowVersionMaps,
    });

    await this.coreWorkflowMigrationWriteService.run({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while writing workflow version content',
      operations: {
        workflowVersion: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: [
            {
              ...flatWorkflowVersion,
              ...(trigger === undefined
                ? {}
                : { triggers: isDefined(trigger) ? [trigger] : null }),
              ...(steps === undefined ? {} : { steps }),
            },
          ],
        },
      },
    });

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          const mirrorUpdateResult = await transactionScope
            .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
              shouldBypassPermissionChecks: true,
            })
            .update({ coreWorkflowVersionId }, mirrorUpdatePayload);

          assertExactlyOneMirrorRowWasWritten({
            affected: mirrorUpdateResult.affected,
            coreWorkflowVersionId,
          });
        },
      );
    }, buildSystemAuthContext(workspaceId));

    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );
  }

  async createDraftCoreWorkflowVersionAndMirror({
    workspaceId,
    coreWorkflowId,
    workspaceWorkflowId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
    workspaceWorkflowId: string;
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }): Promise<{ coreWorkflowVersionId: string }> {
    await this.assertContentIsNotMalformed({
      workspaceId,
      coreWorkflowVersionId: 'new draft',
      trigger,
      steps,
    });

    const coreWorkflowVersionId = uuidv4();
    const workspaceWorkflowVersionId = uuidv4();

    const coreSiblingsCount = await this.countCoreVersions({
      workspaceId,
      coreWorkflowId,
    });

    const position = await this.recordPositionService.buildRecordPosition({
      value: 'first',
      objectMetadata: {
        isCustom: false,
        nameSingular: 'workflowVersion',
      },
      workspaceId,
    });

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const createdAt = new Date().toISOString();

    await this.coreWorkflowMigrationWriteService.run({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while creating workflow version draft',
      operations: {
        workflowVersion: {
          flatEntityToCreate: [
            {
              id: coreWorkflowVersionId,
              universalIdentifier: uuidv4(),
              workflowId: workspaceWorkflowId,
              coreWorkflowId,
              triggers: isDefined(trigger) ? [trigger] : null,
              steps: steps ?? null,
              status: CoreWorkflowVersionStatus.DRAFT,
              workspaceWorkflowVersionId,
              applicationUniversalIdentifier:
                workspaceCustomFlatApplication.universalIdentifier,
              createdAt,
              updatedAt: createdAt,
            },
          ],
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          await transactionScope
            .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
              shouldBypassPermissionChecks: true,
            })
            .insert({
              id: workspaceWorkflowVersionId,
              workflowId: workspaceWorkflowId,
              name: `v${coreSiblingsCount + 1}`,
              status: WorkflowVersionStatus.DRAFT,
              trigger,
              steps,
              position,
              coreWorkflowVersionId,
            });
        },
      );
    }, buildSystemAuthContext(workspaceId));

    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );

    return { coreWorkflowVersionId };
  }

  async countCoreVersions({
    workspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
  }): Promise<number> {
    return this.coreWorkflowVersionRepository.count(workspaceId, {
      where: { coreWorkflowId },
    });
  }

  private async mergeWithPersistedContent({
    workspaceId,
    coreWorkflowVersionId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    trigger?: WorkflowTrigger | null;
    steps?: WorkflowAction[] | null;
  }): Promise<{
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }> {
    if (trigger !== undefined && steps !== undefined) {
      return { trigger, steps };
    }

    const persistedCoreWorkflowVersion =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: { id: coreWorkflowVersionId },
        select: { id: true, triggers: true, steps: true },
      });

    return {
      trigger:
        trigger === undefined
          ? (persistedCoreWorkflowVersion?.triggers?.[0] ?? null)
          : trigger,
      steps:
        steps === undefined
          ? (persistedCoreWorkflowVersion?.steps ?? null)
          : steps,
    };
  }

  private async assertContentIsNotMalformed({
    workspaceId,
    coreWorkflowVersionId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } = await this.workflowMetadataReadService.getFlatEntityMaps(workspaceId);

    try {
      assertWorkflowVersionIsNotMalformedOrThrow({
        trigger,
        steps,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      });
    } catch (error) {
      throw new WorkflowQueryValidationException(
        `Refusing malformed content write on core workflow version '${coreWorkflowVersionId}': ${error instanceof Error ? error.message : String(error)}`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`This change would corrupt the workflow, it was not saved`,
        },
      );
    }
  }
}
