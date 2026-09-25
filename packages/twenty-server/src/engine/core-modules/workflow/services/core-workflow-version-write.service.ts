import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import isEqual from 'lodash.isequal';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus as CoreWorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
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

export class CoreWorkflowVersionPostCommitError extends Error {
  constructor(readonly cause: unknown) {
    super(
      'Workflow version content was committed, but cache invalidation failed',
    );
    this.name = 'CoreWorkflowVersionPostCommitError';
  }
}

@Injectable()
export class CoreWorkflowVersionWriteService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
  ) {}

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

  async getValidatedDraftCoreWorkflowVersion({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId: string;
  }): Promise<ValidatedDraftCoreWorkflowVersion> {
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
      throw new WorkflowQueryValidationException(
        `Core workflow version '${coreWorkflowVersionId}' not found`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version not found`,
        },
      );
    }

    if (isDefined(coreWorkflowVersion.coreWorkflowId)) {
      await this.coreWorkflowAccessService.assertCoreWorkflowsAreEditableOrThrow(
        {
          workspaceId,
          userWorkspaceId,
          coreWorkflowIds: [coreWorkflowVersion.coreWorkflowId],
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
    expectedVersion,
    trigger,
    steps,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    expectedVersion: Pick<WorkflowVersionEntity, 'triggers' | 'steps'>;
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }): Promise<void> {
    await this.assertContentIsNotMalformed({
      workspaceId,
      coreWorkflowVersionId,
      trigger,
      steps,
    });

    // main compared the previous content inside the UPDATE itself to catch two
    // people editing the same draft. The runner cannot express that condition,
    // so the comparison and the write it guards are serialized on this lock.
    await this.withCoreWorkflowVersionEditLock(
      coreWorkflowVersionId,
      async () => {
        const persistedVersion =
          await this.coreWorkflowVersionRepository.findOne(workspaceId, {
            where: { id: coreWorkflowVersionId },
            select: { id: true, triggers: true, steps: true, status: true },
          });

        if (
          !isDefined(persistedVersion) ||
          persistedVersion.status !== CoreWorkflowVersionStatus.DRAFT ||
          !isEqual(
            persistedVersion.triggers ?? null,
            expectedVersion.triggers ?? null,
          ) ||
          !isEqual(
            persistedVersion.steps ?? null,
            expectedVersion.steps ?? null,
          )
        ) {
          throw new WorkflowQueryValidationException(
            `Core workflow version '${coreWorkflowVersionId}' changed during this edit`,
            WorkflowQueryValidationExceptionCode.FORBIDDEN,
            {
              userFriendlyMessage: msg`Workflow version changed, please reload and retry`,
            },
          );
        }

        const { flatWorkflowVersionMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            { workspaceId, flatMapsKeys: ['flatWorkflowVersionMaps'] },
          );

        const flatWorkflowVersion = findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: coreWorkflowVersionId,
          flatEntityMaps: flatWorkflowVersionMaps,
        });

        await this.runCoreWorkflowMigration({
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
                  triggers: isDefined(trigger) ? [trigger] : null,
                  steps,
                },
              ],
            },
          },
        });

        await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
          await this.workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              const mirrorUpdateResult = await transactionScope
                .getRepository<WorkflowVersionWorkspaceEntity>(
                  'workflowVersion',
                  {
                    shouldBypassPermissionChecks: true,
                  },
                )
                .update({ coreWorkflowVersionId }, { trigger, steps });

              assertExactlyOneMirrorRowWasWritten({
                affected: mirrorUpdateResult.affected,
                coreWorkflowVersionId,
              });
            },
          );
        }, buildSystemAuthContext(workspaceId));
      },
    );

    try {
      await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
        workspaceId,
      );
    } catch (error) {
      throw new CoreWorkflowVersionPostCommitError(error);
    }
  }

  private async withCoreWorkflowVersionEditLock<T>(
    coreWorkflowVersionId: string,
    run: () => Promise<T>,
  ): Promise<T> {
    const lockKey = `core-workflow-version-edit-${coreWorkflowVersionId}`;
    const queryRunner = this.coreDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      // Transaction scoped, so the lock is released by the commit below and by
      // any failure that rolls back, including a connection that dies holding it.
      await queryRunner.startTransaction();

      const [lockResult] = (await queryRunner.query(
        'SELECT pg_try_advisory_xact_lock(hashtextextended($1, 0)) AS acquired',
        [lockKey],
      )) as { acquired: boolean }[];

      if (!lockResult?.acquired) {
        throw new WorkflowQueryValidationException(
          `Core workflow version '${coreWorkflowVersionId}' is being edited concurrently`,
          WorkflowQueryValidationExceptionCode.FORBIDDEN,
          {
            userFriendlyMessage: msg`Workflow version changed, please reload and retry`,
          },
        );
      }

      const result = await run();

      await queryRunner.commitTransaction();

      return result;
    } finally {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      await queryRunner.release();
    }
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

    await this.runCoreWorkflowMigration({
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
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
