import { Injectable } from '@nestjs/common';

import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { UserWorkspaceSuccessorService } from 'src/engine/core-modules/user-workspace/services/user-workspace-successor.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class CoreWorkflowOwnershipTransferService {
  constructor(
    private readonly userWorkspaceSuccessorService: UserWorkspaceSuccessorService,
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async transferPrivateWorkflowsToSuccessor({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }): Promise<void> {
    const { workspaceId } = removedUserWorkspace;
    const privateWorkflowsOfRemovedMember = {
      createdByUserWorkspaceId: removedUserWorkspace.id,
      visibility: WorkflowVisibility.PRIVATE,
    };

    const hasPrivateWorkflows = await this.coreWorkflowRepository.exists(
      workspaceId,
      { where: privateWorkflowsOfRemovedMember },
    );

    if (!hasPrivateWorkflows) {
      return;
    }

    const successorUserWorkspace =
      await this.userWorkspaceSuccessorService.findSuccessorUserWorkspace({
        removedUserWorkspace,
        actingUserWorkspaceId,
      });

    if (!isDefined(successorUserWorkspace)) {
      return;
    }

    await this.coreWorkflowRepository.update(
      workspaceId,
      privateWorkflowsOfRemovedMember,
      { createdByUserWorkspaceId: successorUserWorkspace.id },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatWorkflowMaps',
    ]);
  }
}
