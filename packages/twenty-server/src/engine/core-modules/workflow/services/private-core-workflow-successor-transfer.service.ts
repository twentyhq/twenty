import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { UserWorkspaceSuccessorService } from 'src/engine/core-modules/user-workspace/services/user-workspace-successor.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PrivateCoreWorkflowSuccessorTransferService {
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

    const { flatWorkflowMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
      ]);

    const privateWorkflowIds = Object.values(
      flatWorkflowMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatWorkflow) =>
          flatWorkflow.createdByUserWorkspaceId === removedUserWorkspace.id &&
          flatWorkflow.isPrivate,
      )
      .map((flatWorkflow) => flatWorkflow.id);

    if (!isNonEmptyArray(privateWorkflowIds)) {
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
      {
        id: In(privateWorkflowIds),
        createdByUserWorkspaceId: removedUserWorkspace.id,
      },
      { createdByUserWorkspaceId: successorUserWorkspace.id },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatWorkflowMaps',
    ]);
  }
}
