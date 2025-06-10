import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { CreateDraftFromWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/create-draft-from-workflow-version-input';
import { WorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version.dto';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class WorkflowVersionResolver {
  constructor(
    private readonly workflowVersionWorkspaceService: WorkflowVersionWorkspaceService,
  ) {}

  @Mutation(() => WorkflowVersionDTO)
  async createDraftFromWorkflowVersion(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input')
    {
      workflowId,
      workflowVersionIdToCopy,
    }: CreateDraftFromWorkflowVersionInput,
  ): Promise<WorkflowVersionDTO> {
    return {
      id: await this.workflowVersionWorkspaceService.createDraftFromWorkflowVersion(
        {
          workspaceId,
          workflowId,
          workflowVersionIdToCopy,
        },
      ),
    };
  }
}
