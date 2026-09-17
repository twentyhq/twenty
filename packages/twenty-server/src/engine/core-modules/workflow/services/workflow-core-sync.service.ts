import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowEventService } from 'src/engine/core-modules/workflow/services/core-workflow-event.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
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
    private readonly coreWorkflowEventService: CoreWorkflowEventService,
  ) {}

  async upsertToCore(
    workspaceId: string,
    workflows: WorkflowWorkspaceEntity[],
  ): Promise<void> {
    const liveWorkflows = workflows.filter(
      (workflow) => !isDefined(workflow.deletedAt),
    );

    if (liveWorkflows.length === 0) {
      return;
    }

    const applicationId = await this.getCustomApplicationIdOrThrow(workspaceId);

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
        applicationId,
      };
    });

    await this.coreWorkflowRepository.upsert(workspaceId, coreRows, ['id']);

    await this.writeBackCoreWorkflowIds(
      workspaceId,
      coreWorkflowIdByWorkspaceRecordId,
    );

    this.coreWorkflowEventService.publishWorkflowEvents({
      workspaceId,
      events: coreRows.map((coreRow) => ({
        operation: coreWorkflowIdByWorkspaceRecordId.has(
          coreRow.workspaceWorkflowId,
        )
          ? 'created'
          : 'updated',
        coreWorkflowId: coreRow.id,
      })),
    });
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

    await this.coreWorkflowRepository.delete(workspaceId, {
      id: In(coreWorkflowIds),
    });

    this.coreWorkflowEventService.publishWorkflowEvents({
      workspaceId,
      events: coreWorkflowIds.map((coreWorkflowId) => ({
        operation: 'deleted',
        coreWorkflowId,
      })),
    });
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
