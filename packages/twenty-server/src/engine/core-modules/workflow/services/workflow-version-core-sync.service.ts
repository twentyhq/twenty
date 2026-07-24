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
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
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

    const coreVersionIdByWorkspaceRecordId = new Map<string, string>();

    const coreRows = workflowVersions.map((workflowVersion) => {
      const coreWorkflowVersionId = isNonEmptyString(
        workflowVersion.coreWorkflowVersionId,
      )
        ? workflowVersion.coreWorkflowVersionId
        : uuidv4();

      if (!isNonEmptyString(workflowVersion.coreWorkflowVersionId)) {
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

  async mirrorWorkflowVersionWrite({
    workspaceId,
    entityManager,
    workflowVersion,
    applicationId,
  }: {
    workspaceId: string;
    entityManager: WorkspaceEntityManager;
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

    const isNewLink = !isNonEmptyString(workflowVersion.coreWorkflowVersionId);
    const coreWorkflowVersionId = isNonEmptyString(
      workflowVersion.coreWorkflowVersionId,
    )
      ? workflowVersion.coreWorkflowVersionId
      : uuidv4();

    const queryRunner = entityManager.queryRunner;

    if (!isDefined(queryRunner)) {
      throw new Error(
        'Transactional core mirror requires a transaction-scoped entity manager',
      );
    }

    await queryRunner.query(
      `INSERT INTO core."workflowVersion"
         ("id", "workspaceId", "workflowId", "triggers", "steps", "status", "universalIdentifier", "applicationId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT ("id") DO UPDATE SET
         "triggers" = EXCLUDED."triggers",
         "steps" = EXCLUDED."steps",
         "status" = EXCLUDED."status"`,
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
      await this.writeBackCoreVersionIdOnManager(
        workspaceId,
        workflowVersion.id,
        coreWorkflowVersionId,
        entityManager,
      );
    }

    return { coreWorkflowVersionId };
  }

  async mirrorWorkflowVersionWrites({
    workspaceId,
    entityManager,
    workflowVersions,
  }: {
    workspaceId: string;
    entityManager: WorkspaceEntityManager;
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
        entityManager,
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
      entityManager: WorkspaceEntityManager,
    ) => Promise<string>,
  ): Promise<void> {
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          workspaceId,
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const dataSource =
        await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();
      const queryRunner = dataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const workflowVersionId = await write(
          workflowVersionRepository,
          queryRunner.manager,
        );

        const workflowVersion = await workflowVersionRepository.findOne(
          { where: { id: workflowVersionId } },
          queryRunner.manager,
        );

        if (isDefined(workflowVersion)) {
          await this.mirrorWorkflowVersionWrite({
            workspaceId,
            entityManager: queryRunner.manager,
            workflowVersion,
          });
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }

        throw error;
      } finally {
        await queryRunner.release();
      }
    }, buildSystemAuthContext(workspaceId));

    await this.invalidateAutomatedTriggerMaps(workspaceId);
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

  private async writeBackCoreVersionIdOnManager(
    workspaceId: string,
    workflowVersionId: string,
    coreWorkflowVersionId: string,
    entityManager: WorkspaceEntityManager,
  ): Promise<void> {
    const workspaceWorkflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    await workspaceWorkflowVersionRepository.update(
      { id: workflowVersionId },
      { coreWorkflowVersionId },
      undefined,
      entityManager,
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
