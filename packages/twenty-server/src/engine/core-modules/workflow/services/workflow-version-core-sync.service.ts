import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/global-workspace-datasource/types/workspace-transaction-scope.type';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@Injectable()
export class WorkflowVersionCoreSyncService {
  private readonly logger = new Logger(WorkflowVersionCoreSyncService.name);

  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async upsertToCore(
    workspaceId: string,
    workflowVersions: WorkflowVersionWorkspaceEntity[],
  ): Promise<void> {
    if (workflowVersions.length === 0) {
      return;
    }

    const applicationId = await this.getCustomApplicationIdOrThrow(workspaceId);

    const linkedCoreVersionIds = await this.resolveOwnedCoreVersionIds(
      workspaceId,
      workflowVersions,
    );

    const coreVersionIdByWorkspaceRecordId = new Map<string, string>();

    const coreRows = workflowVersions.map((workflowVersion) => {
      const isLinked =
        isNonEmptyString(workflowVersion.coreWorkflowVersionId) &&
        linkedCoreVersionIds.has(workflowVersion.coreWorkflowVersionId);

      const coreWorkflowVersionId = isLinked
        ? (workflowVersion.coreWorkflowVersionId as string)
        : uuidv4();

      if (!isLinked) {
        coreVersionIdByWorkspaceRecordId.set(
          workflowVersion.id,
          coreWorkflowVersionId,
        );
      }

      return {
        id: coreWorkflowVersionId,
        workflowId: workflowVersion.workflowId,
        triggers: isDefined(workflowVersion.trigger)
          ? [workflowVersion.trigger]
          : null,
        steps: workflowVersion.steps ?? null,
        status: workflowVersion.status as unknown as WorkflowVersionStatus,
        universalIdentifier: uuidv4(),
        applicationId,
      };
    });

    await this.coreWorkflowVersionRepository.upsert(workspaceId, coreRows, [
      'id',
    ]);

    await this.writeBackCoreVersionIds(
      workspaceId,
      coreVersionIdByWorkspaceRecordId,
    );

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  // coreWorkflowVersionId is a writable column on the workspace record, so a
  // caller can point it at a core row owned by another workspace. Only ids
  // that already resolve inside this workspace are honoured; anything else is
  // treated as unlinked and gets a fresh row.
  private async resolveOwnedCoreVersionIds(
    workspaceId: string,
    workflowVersions: WorkflowVersionWorkspaceEntity[],
  ): Promise<Set<string>> {
    const candidateIds = workflowVersions
      .map((workflowVersion) => workflowVersion.coreWorkflowVersionId)
      .filter(isNonEmptyString);

    if (candidateIds.length === 0) {
      return new Set();
    }

    const ownedRows = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { id: In(candidateIds) },
        select: { id: true },
      },
    );

    return new Set(ownedRows.map((row) => row.id));
  }

  async deleteFromCore(
    workspaceId: string,
    coreWorkflowVersionIds: string[],
  ): Promise<void> {
    if (coreWorkflowVersionIds.length === 0) {
      return;
    }

    await this.coreWorkflowVersionRepository.delete(workspaceId, {
      id: In(coreWorkflowVersionIds),
    });

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  async findCoreVersionById(
    workspaceId: string,
    coreWorkflowVersionId: string,
  ): Promise<WorkflowVersionEntity | null> {
    return this.coreWorkflowVersionRepository.findOne(workspaceId, {
      where: { id: coreWorkflowVersionId },
    });
  }

  async mirrorWorkflowVersionWrite({
    workspaceId,
    transactionScope,
    workflowVersion,
    applicationId,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    applicationId?: string;
  }): Promise<{ coreWorkflowVersionId: string } | null> {
    if (!(await this.workspaceHasCoreWorkflowVersionIdField(workspaceId))) {
      this.logger.warn(
        `workflowVersion.coreWorkflowVersionId field missing for workspace ${workspaceId}, skipping transactional core mirror`,
      );

      return null;
    }

    const resolvedApplicationId =
      applicationId ?? (await this.getCustomApplicationIdOrThrow(workspaceId));

    const ownedCoreWorkflowVersionId = isNonEmptyString(
      workflowVersion.coreWorkflowVersionId,
    )
      ? await this.resolveOwnedCoreVersionIdInTransaction({
          coreWorkflowVersionId: workflowVersion.coreWorkflowVersionId,
          workspaceId,
          transactionScope,
        })
      : null;

    const isNewLink = !isDefined(ownedCoreWorkflowVersionId);
    const coreWorkflowVersionId = ownedCoreWorkflowVersionId ?? uuidv4();

    // The DO UPDATE is guarded on workspaceId as well: the conflict target is
    // the primary key alone, so without it a core row owned by another
    // workspace would have its triggers and steps overwritten.
    await transactionScope.executeRawQuery(
      `INSERT INTO core."workflowVersion"
         ("id", "workspaceId", "workflowId", "triggers", "steps", "status", "universalIdentifier", "applicationId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT ("id") DO UPDATE SET
         "triggers" = EXCLUDED."triggers",
         "steps" = EXCLUDED."steps",
         "status" = EXCLUDED."status"
       WHERE core."workflowVersion"."workspaceId" = EXCLUDED."workspaceId"`,
      [
        coreWorkflowVersionId,
        workspaceId,
        workflowVersion.workflowId,
        isDefined(workflowVersion.trigger)
          ? JSON.stringify([workflowVersion.trigger])
          : null,
        isDefined(workflowVersion.steps)
          ? JSON.stringify(workflowVersion.steps)
          : null,
        workflowVersion.status,
        uuidv4(),
        resolvedApplicationId,
      ],
    );

    if (isNewLink) {
      await this.writeBackCoreVersionIdInTransaction(
        workflowVersion.id,
        coreWorkflowVersionId,
        transactionScope,
      );
    }

    return { coreWorkflowVersionId };
  }

  // coreWorkflowVersionId comes from a writable column on the workspace record,
  // so it can point at a core row owned by another workspace. Resolve it inside
  // the transaction and treat anything not owned here as a new link.
  private async resolveOwnedCoreVersionIdInTransaction({
    coreWorkflowVersionId,
    workspaceId,
    transactionScope,
  }: {
    coreWorkflowVersionId: string;
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<string | null> {
    const rows = await transactionScope.executeRawQuery(
      `SELECT "id" FROM core."workflowVersion" WHERE "id" = $1 AND "workspaceId" = $2`,
      [coreWorkflowVersionId, workspaceId],
    );

    return rows.length > 0 ? coreWorkflowVersionId : null;
  }

  async mirrorWorkflowVersionWrites({
    workspaceId,
    transactionScope,
    workflowVersions,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    workflowVersions: WorkflowVersionWorkspaceEntity[];
  }): Promise<Map<string, string>> {
    const coreIdByWorkspaceRecordId = new Map<string, string>();

    if (workflowVersions.length === 0) {
      return coreIdByWorkspaceRecordId;
    }

    const applicationId = await this.getCustomApplicationIdOrThrow(workspaceId);

    for (const workflowVersion of workflowVersions) {
      const result = await this.mirrorWorkflowVersionWrite({
        workspaceId,
        transactionScope,
        workflowVersion,
        applicationId,
      });

      if (isDefined(result)) {
        coreIdByWorkspaceRecordId.set(
          workflowVersion.id,
          result.coreWorkflowVersionId,
        );
      }
    }

    return coreIdByWorkspaceRecordId;
  }

  async writeWorkflowVersionAndMirror(
    workspaceId: string,
    write: (
      workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
      transactionScope: WorkspaceTransactionScope,
    ) => Promise<string>,
  ): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.globalWorkspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          const workflowVersionRepository =
            transactionScope.getRepository<WorkflowVersionWorkspaceEntity>(
              'workflowVersion',
              { shouldBypassPermissionChecks: true },
            );

          const workflowVersionId = await write(
            workflowVersionRepository,
            transactionScope,
          );

          const workflowVersion = await workflowVersionRepository.findOne({
            where: { id: workflowVersionId },
          });

          if (isDefined(workflowVersion)) {
            await this.mirrorWorkflowVersionWrite({
              workspaceId,
              transactionScope,
              workflowVersion,
            });
          }
        },
      );
    }, buildSystemAuthContext(workspaceId));

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  async deleteCoreVersionsByWorkflowIds(
    workspaceId: string,
    workflowIds: string[],
  ): Promise<void> {
    if (workflowIds.length === 0) {
      return;
    }

    await this.coreWorkflowVersionRepository.delete(workspaceId, {
      workflowId: In(workflowIds),
    });

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  async deleteCoreVersionsByWorkspaceVersionIds(
    workspaceId: string,
    workflowVersionIds: string[],
  ): Promise<void> {
    if (workflowVersionIds.length === 0) {
      return;
    }

    const coreWorkflowVersionIds =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowVersionRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
              workspaceId,
              'workflowVersion',
              { shouldBypassPermissionChecks: true },
            );

          const versions = await workflowVersionRepository.find({
            where: { id: In(workflowVersionIds) },
            withDeleted: true,
          });

          return versions
            .map((version) => version.coreWorkflowVersionId)
            .filter(isNonEmptyString);
        },
        buildSystemAuthContext(workspaceId),
      );

    await this.deleteFromCore(workspaceId, coreWorkflowVersionIds);
  }

  async recreateCoreVersionsByWorkflowId(
    workspaceId: string,
    workflowId: string,
  ): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          workspaceId,
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const versions = await workflowVersionRepository.find({
        where: { workflowId },
      });

      await this.upsertToCore(workspaceId, versions);
    }, buildSystemAuthContext(workspaceId));
  }

  private async writeBackCoreVersionIds(
    workspaceId: string,
    coreVersionIdByWorkspaceRecordId: Map<string, string>,
  ): Promise<void> {
    if (coreVersionIdByWorkspaceRecordId.size === 0) {
      return;
    }

    if (!(await this.workspaceHasCoreWorkflowVersionIdField(workspaceId))) {
      this.logger.warn(
        `workflowVersion.coreWorkflowVersionId field missing for workspace ${workspaceId}, skipping core id write-back`,
      );

      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceWorkflowVersionRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          workspaceId,
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      for (const [
        workspaceRecordId,
        coreWorkflowVersionId,
      ] of coreVersionIdByWorkspaceRecordId) {
        await workspaceWorkflowVersionRepository.update(workspaceRecordId, {
          coreWorkflowVersionId,
        });
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private async writeBackCoreVersionIdInTransaction(
    workflowVersionId: string,
    coreWorkflowVersionId: string,
    transactionScope: WorkspaceTransactionScope,
  ): Promise<void> {
    const workspaceWorkflowVersionRepository =
      transactionScope.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    await workspaceWorkflowVersionRepository.update(
      { id: workflowVersionId },
      { coreWorkflowVersionId },
    );
  }

  private async workspaceHasCoreWorkflowVersionIdField(
    workspaceId: string,
  ): Promise<boolean> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowVersion.fields.coreWorkflowVersionId
          .universalIdentifier
      ],
    );
  }

  private async getCustomApplicationIdOrThrow(
    workspaceId: string,
  ): Promise<string> {
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

  async invalidateAutomatedTriggerMaps(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }
}
