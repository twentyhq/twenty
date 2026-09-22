import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type CoreWorkflowFavoriteTarget = {
  coreWorkflowId: string;
  name: string | null;
  workspaceWorkflowId: string | null;
};

@Injectable()
export class CoreWorkflowFavoriteTargetService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
  ) {}

  async resolveFavoriteTarget({
    workspaceId,
    userWorkspaceId,
    targetRecordId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    targetRecordId: string;
  }): Promise<CoreWorkflowFavoriteTarget | null> {
    const [coreWorkflow] = await this.coreWorkflowRepository.find(workspaceId, {
      where: [{ id: targetRecordId }, { workspaceWorkflowId: targetRecordId }],
      select: { id: true, name: true, workspaceWorkflowId: true },
      order: { createdAt: 'ASC', id: 'ASC' },
      take: 1,
    });

    if (!isDefined(coreWorkflow)) {
      return null;
    }

    const isAccessible =
      await this.coreWorkflowAccessService.isCoreWorkflowAccessible({
        workspaceId,
        userWorkspaceId,
        coreWorkflowId: coreWorkflow.id,
      });

    if (!isAccessible) {
      return null;
    }

    return {
      coreWorkflowId: coreWorkflow.id,
      name: coreWorkflow.name,
      workspaceWorkflowId: coreWorkflow.workspaceWorkflowId,
    };
  }
}
