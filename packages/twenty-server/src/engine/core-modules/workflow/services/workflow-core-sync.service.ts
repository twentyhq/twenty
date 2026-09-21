import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { WorkflowVisibility } from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  CoreWorkflowMetadataException,
  CoreWorkflowMetadataExceptionCode,
} from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@Injectable()
export class WorkflowCoreSyncService {
  private readonly logger = new Logger(WorkflowCoreSyncService.name);

  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

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

  async upsertToCore(
    workspaceId: string,
    workspaceWorkflowIds: string[],
  ): Promise<void> {
    if (workspaceWorkflowIds.length === 0) {
      return;
    }

    const liveWorkflows =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowRepository =
          this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        return workflowRepository.find({
          where: { id: In(workspaceWorkflowIds) },
        });
      }, buildSystemAuthContext(workspaceId));

    if (liveWorkflows.length === 0) {
      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const workspaceWorkflowIdByOwnedCoreWorkflowId =
      await this.resolveWorkspaceWorkflowIdByOwnedCoreWorkflowId(
        workspaceId,
        liveWorkflows,
      );

    const coreVersionIdByWorkspaceVersionId =
      await this.resolveCoreVersionIdByWorkspaceVersionId(
        workspaceId,
        liveWorkflows,
      );

    const coreWorkflowIdByWorkspaceRecordId = new Map<string, string>();

    const coreRows = liveWorkflows.map((workflow) => {
      const candidateCoreWorkflowId = workflow.coreWorkflowId;

      const linkedCoreWorkflowId =
        isNonEmptyString(candidateCoreWorkflowId) &&
        workspaceWorkflowIdByOwnedCoreWorkflowId.has(candidateCoreWorkflowId)
          ? candidateCoreWorkflowId
          : null;

      const coreWorkflowId = linkedCoreWorkflowId ?? uuidv4();

      if (!isDefined(linkedCoreWorkflowId)) {
        coreWorkflowIdByWorkspaceRecordId.set(workflow.id, coreWorkflowId);
      }

      const storedWorkspaceWorkflowId = isDefined(linkedCoreWorkflowId)
        ? workspaceWorkflowIdByOwnedCoreWorkflowId.get(linkedCoreWorkflowId)
        : null;

      return {
        id: coreWorkflowId,
        name: workflow.name ?? null,
        workspaceWorkflowId: isNonEmptyString(storedWorkspaceWorkflowId)
          ? storedWorkspaceWorkflowId
          : workflow.id,
        lastPublishedVersionId: isNonEmptyString(
          workflow.lastPublishedVersionId,
        )
          ? workflow.lastPublishedVersionId
          : null,
        lastPublishedCoreWorkflowVersionId: isNonEmptyString(
          workflow.lastPublishedVersionId,
        )
          ? (coreVersionIdByWorkspaceVersionId.get(
              workflow.lastPublishedVersionId,
            ) ?? null)
          : null,
        createdAt: new Date(workflow.createdAt),
        universalIdentifier: uuidv4(),
      };
    });

    const { flatWorkflowMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowMaps'] },
      );

    const flatWorkflowsToCreate: (UniversalFlatWorkflow & { id?: string })[] =
      [];
    const flatWorkflowsToUpdate: UniversalFlatWorkflow[] = [];

    // The cache decides which rows exist, so a stale map would send a persisted
    // id down the create branch and hit the primary key. The table decides.
    const persistedCoreWorkflowIds = new Set(
      (
        await this.coreWorkflowRepository.find(workspaceId, {
          where: { id: In(coreRows.map(({ id }) => id)) },
          select: { id: true },
        })
      ).map(({ id }) => id),
    );

    for (const coreRow of coreRows) {
      const existingFlatWorkflow = persistedCoreWorkflowIds.has(coreRow.id)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: coreRow.id,
            flatEntityMaps: flatWorkflowMaps,
          })
        : undefined;

      if (
        persistedCoreWorkflowIds.has(coreRow.id) &&
        !isDefined(existingFlatWorkflow)
      ) {
        throw new CoreWorkflowMetadataException(
          `Core workflow ${coreRow.id} is persisted but missing from the flat entity maps`,
          CoreWorkflowMetadataExceptionCode.WORKFLOW_NOT_FOUND,
        );
      }

      const flatWorkflow: UniversalFlatWorkflow = {
        universalIdentifier: coreRow.universalIdentifier,
        name: coreRow.name,
        workspaceWorkflowId: coreRow.workspaceWorkflowId,
        lastPublishedVersionId: coreRow.lastPublishedVersionId,
        lastPublishedCoreWorkflowVersionId:
          coreRow.lastPublishedCoreWorkflowVersionId,
        visibility: WorkflowVisibility.WORKSPACE,
        createdByUserWorkspaceId: null,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        createdAt: coreRow.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isDefined(existingFlatWorkflow)) {
        flatWorkflowsToUpdate.push({
          ...existingFlatWorkflow,
          ...flatWorkflow,
          universalIdentifier: existingFlatWorkflow.universalIdentifier,
          createdAt: existingFlatWorkflow.createdAt,
          visibility: existingFlatWorkflow.visibility,
          createdByUserWorkspaceId:
            existingFlatWorkflow.createdByUserWorkspaceId,
        });
      } else {
        flatWorkflowsToCreate.push({ ...flatWorkflow, id: coreRow.id });
      }
    }

    await this.runCoreWorkflowMigration({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while mirroring workflows to core',
      operations: {
        workflow: {
          flatEntityToCreate: flatWorkflowsToCreate,
          flatEntityToDelete: [],
          flatEntityToUpdate: flatWorkflowsToUpdate,
        },
      },
    });

    await this.writeBackCoreWorkflowIds(
      workspaceId,
      coreWorkflowIdByWorkspaceRecordId,
    );
  }

  async reconcileWorkspaceWorkflows(
    workspaceId: string,
    workspaceWorkflowIds: string[],
  ): Promise<void> {
    const schema = getWorkspaceSchemaName(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          for (const workspaceWorkflowId of [
            ...new Set(workspaceWorkflowIds),
          ].sort()) {
            const workflows = (await transactionScope.executeRawQuery(
              `SELECT * FROM "${schema}"."workflow" WHERE id = $1 FOR UPDATE`,
              [workspaceWorkflowId],
            )) as Pick<
              WorkflowWorkspaceEntity,
              | 'id'
              | 'name'
              | 'coreWorkflowId'
              | 'lastPublishedVersionId'
              | 'deletedAt'
            >[];
            const workflow = workflows[0];

            if (!isDefined(workflow) || isDefined(workflow.deletedAt)) {
              await transactionScope.executeRawQuery(
                `DELETE FROM core."workflow" WHERE "workspaceId" = $1 AND "workspaceWorkflowId" = $2`,
                [workspaceId, workspaceWorkflowId],
              );
              continue;
            }

            const coreWorkflows = (await transactionScope.executeRawQuery(
              `SELECT id FROM core."workflow" WHERE "workspaceId" = $1 AND "workspaceWorkflowId" = $2 FOR UPDATE`,
              [workspaceId, workspaceWorkflowId],
            )) as { id: string }[];

            if (
              coreWorkflows.length !== 1 ||
              workflow.coreWorkflowId !== coreWorkflows[0].id
            ) {
              throw new Error(
                `Invalid core mapping for workflow ${workspaceWorkflowId} in workspace ${workspaceId}`,
              );
            }

            const coreWorkflowId = coreWorkflows[0].id;
            let coreWorkflowVersionId: string | null = null;

            if (isNonEmptyString(workflow.lastPublishedVersionId)) {
              const versions = (await transactionScope.executeRawQuery(
                `SELECT id FROM core."workflowVersion" WHERE "workspaceId" = $1 AND "workspaceWorkflowVersionId" = $2 AND "coreWorkflowId" = $3`,
                [workspaceId, workflow.lastPublishedVersionId, coreWorkflowId],
              )) as { id: string }[];

              if (versions.length !== 1) {
                throw new Error(
                  `Invalid published core version mapping for workflow ${workspaceWorkflowId} in workspace ${workspaceId}`,
                );
              }

              coreWorkflowVersionId = versions[0].id;
            }

            await transactionScope.executeRawQuery(
              `UPDATE core."workflow" SET "name" = $3, "lastPublishedVersionId" = $4, "lastPublishedCoreWorkflowVersionId" = $5, "updatedAt" = now() WHERE id = $1 AND "workspaceId" = $2`,
              [
                coreWorkflowId,
                workspaceId,
                workflow.name ?? null,
                isNonEmptyString(workflow.lastPublishedVersionId)
                  ? workflow.lastPublishedVersionId
                  : null,
                coreWorkflowVersionId,
              ],
            );
          }
        },
      );
    }, buildSystemAuthContext(workspaceId));
  }

  private async resolveCoreVersionIdByWorkspaceVersionId(
    workspaceId: string,
    workflows: WorkflowWorkspaceEntity[],
  ): Promise<Map<string, string>> {
    const publishedVersionIds = workflows
      .map((workflow) => workflow.lastPublishedVersionId)
      .filter(isNonEmptyString);

    if (publishedVersionIds.length === 0) {
      return new Map();
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const rows = await workflowVersionRepository.find({
        where: { id: In(publishedVersionIds) },
        select: { id: true, coreWorkflowVersionId: true },
      });

      return new Map(
        rows.flatMap((row) =>
          isNonEmptyString(row.coreWorkflowVersionId)
            ? [[row.id, row.coreWorkflowVersionId] as const]
            : [],
        ),
      );
    }, buildSystemAuthContext(workspaceId));
  }

  // coreWorkflowId is a writable column on the workspace record, so a caller
  // can point it at a core row owned by another workspace.
  private async resolveWorkspaceWorkflowIdByOwnedCoreWorkflowId(
    workspaceId: string,
    workflows: WorkflowWorkspaceEntity[],
  ): Promise<Map<string, string | null>> {
    const candidateIds = workflows
      .map((workflow) => workflow.coreWorkflowId)
      .filter(isNonEmptyString);

    if (candidateIds.length === 0) {
      return new Map();
    }

    const ownedRows = await this.coreWorkflowRepository.find(workspaceId, {
      where: { id: In(candidateIds) },
      select: { id: true, workspaceWorkflowId: true },
    });

    return new Map(
      ownedRows.map((row) => [row.id, row.workspaceWorkflowId ?? null]),
    );
  }

  async deleteFromCore(
    workspaceId: string,
    coreWorkflowIds: string[],
  ): Promise<void> {
    if (coreWorkflowIds.length === 0) {
      return;
    }

    const { flatWorkflowMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowMaps'] },
      );

    const resolvedFlatWorkflows = coreWorkflowIds.map((coreWorkflowId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: coreWorkflowId,
        flatEntityMaps: flatWorkflowMaps,
      }),
    );

    const missingCoreWorkflowIds = coreWorkflowIds.filter(
      (_, index) => !isDefined(resolvedFlatWorkflows[index]),
    );

    // The dual-write listener deletes the same rows when the workspace mirror is
    // soft-deleted, so an id that is gone from both the cache and the table is an
    // idempotent no-op. An id still in the table is a stale cache and must fail
    // rather than leave an orphan that still reads and still broadcasts.
    if (missingCoreWorkflowIds.length > 0) {
      const stillPersisted = await this.coreWorkflowRepository.find(
        workspaceId,
        { where: { id: In(missingCoreWorkflowIds) }, select: { id: true } },
      );

      if (stillPersisted.length > 0) {
        throw new CoreWorkflowMetadataException(
          `Core workflows ${stillPersisted.map(({ id }) => id).join(', ')} are persisted but missing from the flat entity maps`,
          CoreWorkflowMetadataExceptionCode.WORKFLOW_NOT_FOUND,
        );
      }
    }

    const flatWorkflowsToDelete = resolvedFlatWorkflows.filter(isDefined);

    if (flatWorkflowsToDelete.length === 0) {
      return;
    }

    await this.runCoreWorkflowMigration({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while deleting workflows',
      operations: {
        workflow: {
          flatEntityToCreate: [],
          flatEntityToDelete: flatWorkflowsToDelete,
          flatEntityToUpdate: [],
        },
      },
    });
  }

  async findCoreWorkflowById(
    workspaceId: string,
    coreWorkflowId: string,
  ): Promise<WorkflowEntity | null> {
    return this.coreWorkflowRepository.findOne(workspaceId, {
      where: { id: coreWorkflowId },
    });
  }

  async findCoreWorkflowByIdOrWorkspaceWorkflowId(
    workspaceId: string,
    workflowId: string,
  ): Promise<WorkflowEntity | null> {
    const workflows = await this.coreWorkflowRepository.find(workspaceId, {
      where: [{ id: workflowId }, { workspaceWorkflowId: workflowId }],
    });

    if (workflows.length > 1) {
      throw new Error(
        `Ambiguous core workflow mapping for ${workflowId} in workspace ${workspaceId}`,
      );
    }

    return workflows[0] ?? null;
  }

  private async writeBackCoreWorkflowIds(
    workspaceId: string,
    coreWorkflowIdByWorkspaceRecordId: Map<string, string>,
  ): Promise<void> {
    if (coreWorkflowIdByWorkspaceRecordId.size === 0) {
      return;
    }

    if (!(await this.workspaceHasCoreWorkflowIdField(workspaceId))) {
      this.logger.warn(
        `workflow.coreWorkflowId field missing for workspace ${workspaceId}, skipping core id write-back`,
      );

      return;
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceWorkflowRepository =
        this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
          'workflow',
          { shouldBypassPermissionChecks: true },
        );

      for (const [
        workspaceRecordId,
        coreWorkflowId,
      ] of coreWorkflowIdByWorkspaceRecordId) {
        await workspaceWorkflowRepository.update(workspaceRecordId, {
          coreWorkflowId,
        });
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private async workspaceHasCoreWorkflowIdField(
    workspaceId: string,
  ): Promise<boolean> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflow.fields.coreWorkflowId.universalIdentifier
      ],
    );
  }

  async getCustomApplicationIdOrThrow(workspaceId: string): Promise<string> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: ['id', 'workspaceCustomApplicationId'],
    });

    if (!isDefined(workspace?.workspaceCustomApplicationId)) {
      throw new Error(
        `Workspace custom application not found for workspace ${workspaceId}`,
      );
    }

    return workspace.workspaceCustomApplicationId;
  }
}
