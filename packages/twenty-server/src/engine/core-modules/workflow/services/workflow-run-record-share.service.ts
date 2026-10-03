import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordSharePrincipalType,
  RecordShareRowCause,
  WorkflowVisibility,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, In } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { buildWorkflowRunRecordShares } from 'src/engine/core-modules/workflow/utils/build-workflow-run-record-shares.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

// Keeps each grant write well under Postgres' bind parameter limit.
const WORKFLOW_RUN_BATCH_SIZE = 500;

// A whole workflow's runs can take longer than the default lock lifetime.
const CORE_WORKFLOW_LOCK_OPTIONS = { ttl: 30_000, maxRetries: 300 };

type CoreWorkflowAccess = {
  isWorkspaceVisible: boolean;
  creatorWorkspaceMemberId: string | null;
};

// runs carry their workflow's data, so their grants are derived from it and replaced wholesale to revoke what the old state granted
@Injectable()
export class WorkflowRunRecordShareService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  // lock held across both steps so a run created meanwhile is not granted from the replaced state
  async updateAccessThenSyncRuns<TResult>({
    workspaceId,
    coreWorkflowId,
    updateAccess,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
    updateAccess: () => Promise<TResult>;
  }): Promise<TResult> {
    return this.withCoreWorkflowLock(
      { workspaceId, coreWorkflowId },
      async () => {
        const result = await updateAccess();

        await this.replaceSharesOfAllRuns({ workspaceId, coreWorkflowId });

        return result;
      },
    );
  }

  async syncRunsOfCoreWorkflows({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<void> {
    for (const coreWorkflowId of new Set(coreWorkflowIds)) {
      await this.withCoreWorkflowLock({ workspaceId, coreWorkflowId }, () =>
        this.replaceSharesOfAllRuns({ workspaceId, coreWorkflowId }),
      );
    }
  }

  async syncRuns({
    workspaceId,
    workflowRunIds,
  }: {
    workspaceId: string;
    workflowRunIds: string[];
  }): Promise<void> {
    const runs = await this.findRuns({
      workspaceId,
      where: { id: In(workflowRunIds) },
    });
    const runIdsByCoreWorkflowId = new Map<string | null, string[]>();

    for (const run of runs) {
      runIdsByCoreWorkflowId.set(run.coreWorkflowId, [
        ...(runIdsByCoreWorkflowId.get(run.coreWorkflowId) ?? []),
        run.id,
      ]);
    }

    for (const [coreWorkflowId, runIds] of runIdsByCoreWorkflowId) {
      if (!isDefined(coreWorkflowId)) {
        await this.replaceShares({
          workspaceId,
          workflowRunIds: runIds,
          access: { isWorkspaceVisible: true, creatorWorkspaceMemberId: null },
        });
        continue;
      }

      await this.withCoreWorkflowLock(
        { workspaceId, coreWorkflowId },
        async () =>
          this.replaceShares({
            workspaceId,
            workflowRunIds: runIds,
            access: await this.resolveAccess({ workspaceId, coreWorkflowId }),
          }),
      );
    }
  }

  async findCoreWorkflowIdsCreatedBy({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<string[]> {
    const coreWorkflows = await this.coreWorkflowRepository.find(workspaceId, {
      where: { createdByUserWorkspaceId: userWorkspaceId },
      select: { id: true },
      withDeleted: true,
    });

    return coreWorkflows.map(({ id }) => id);
  }

  private async replaceSharesOfAllRuns({
    workspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
  }): Promise<void> {
    const runs = await this.findRuns({
      workspaceId,
      where: { coreWorkflowId },
    });

    await this.replaceShares({
      workspaceId,
      workflowRunIds: runs.map(({ id }) => id),
      access: await this.resolveAccess({ workspaceId, coreWorkflowId }),
    });
  }

  private async replaceShares({
    workspaceId,
    workflowRunIds,
    access,
  }: {
    workspaceId: string;
    workflowRunIds: string[];
    access: CoreWorkflowAccess;
  }): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const objectMetadataId =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowRun.universalIdentifier
      ]?.id;

    if (!isDefined(objectMetadataId)) {
      return;
    }

    for (
      let offset = 0;
      offset < workflowRunIds.length;
      offset += WORKFLOW_RUN_BATCH_SIZE
    ) {
      const batch = workflowRunIds.slice(
        offset,
        offset + WORKFLOW_RUN_BATCH_SIZE,
      );
      const recordScope = { objectMetadataId, recordId: In(batch) };

      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              await this.recordShareStorageService.deleteMatching({
                workspaceId,
                transactionScope,
                criteria: [
                  // grants written on the run's own behalf: those derived here, and the APPLICATION creator-role
                  // grant, which would otherwise let that role read a private workflow's runs
                  { ...recordScope, sourceId: In(batch) },
                  { ...recordScope, rowCause: RecordShareRowCause.APPLICATION },
                  // a grant to everyone means workspace-visible, which only the core workflow decides
                  {
                    ...recordScope,
                    principalType: RecordSharePrincipalType.EVERYONE,
                  },
                ],
              });
              await this.recordShareStorageService.insertMany({
                workspaceId,
                transactionScope,
                recordShares: buildWorkflowRunRecordShares({
                  objectMetadataId,
                  workflowRunIds: batch,
                  ...access,
                }),
              });
            },
          ),
        buildSystemAuthContext(workspaceId),
      );
    }
  }

  private async resolveAccess({
    workspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
  }): Promise<CoreWorkflowAccess> {
    const coreWorkflow = await this.coreWorkflowRepository.findOne(
      workspaceId,
      {
        where: { id: coreWorkflowId },
        select: { id: true, visibility: true, createdByUserWorkspaceId: true },
        withDeleted: true,
      },
    );

    if (!isDefined(coreWorkflow)) {
      return { isWorkspaceVisible: true, creatorWorkspaceMemberId: null };
    }

    return {
      isWorkspaceVisible:
        coreWorkflow.visibility === WorkflowVisibility.WORKSPACE ||
        !isDefined(coreWorkflow.createdByUserWorkspaceId),
      creatorWorkspaceMemberId: isDefined(coreWorkflow.createdByUserWorkspaceId)
        ? await this.resolveWorkspaceMemberId({
            workspaceId,
            userWorkspaceId: coreWorkflow.createdByUserWorkspaceId,
          })
        : null,
    };
  }

  private async resolveWorkspaceMemberId({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<string | null> {
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    return flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspaceId] ?? null;
  }

  private findRuns({
    workspaceId,
    where,
  }: {
    workspaceId: string;
    where: FindOptionsWhere<WorkflowRunWorkspaceEntity>;
  }): Promise<Pick<WorkflowRunWorkspaceEntity, 'id' | 'coreWorkflowId'>[]> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository<WorkflowRunWorkspaceEntity>('workflowRun', {
            shouldBypassPermissionChecks: true,
          })
          .find({
            where,
            select: { id: true, coreWorkflowId: true },
            withDeleted: true,
          }),
      buildSystemAuthContext(workspaceId),
    );
  }

  private withCoreWorkflowLock<TResult>(
    {
      workspaceId,
      coreWorkflowId,
    }: { workspaceId: string; coreWorkflowId: string },
    work: () => Promise<TResult>,
  ): Promise<TResult> {
    return this.cacheLockService.withLock(
      work,
      `workflow-run-record-shares:${workspaceId}:${coreWorkflowId}`,
      CORE_WORKFLOW_LOCK_OPTIONS,
    );
  }
}
