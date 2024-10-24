import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { User } from 'src/engine/core-modules/user/user.entity';
import { RunWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/run-workflow-version-input.dto';
import { WorkflowRunDTO } from 'src/engine/core-modules/workflow/dtos/workflow-run.dto';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
@UseFilters(WorkflowTriggerGraphqlApiExceptionFilter)
export class WorkflowTriggerResolver {
  constructor(
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  @Mutation(() => Boolean)
  async activateWorkflowVersion(
    @Args('workflowVersionId') workflowVersionId: string,
  ) {
    return await this.workflowTriggerWorkspaceService.activateWorkflowVersion(
      workflowVersionId,
    );
  }

  @Mutation(() => Boolean)
  async deactivateWorkflowVersion(
    @Args('workflowVersionId') workflowVersionId: string,
  ) {
    return await this.workflowTriggerWorkspaceService.deactivateWorkflowVersion(
      workflowVersionId,
    );
  }

  @Mutation(() => WorkflowRunDTO)
  async runWorkflowVersion(
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthUser() user: User,
    @Args('input') { workflowVersionId, payload }: RunWorkflowVersionInput,
  ) {
    return await this.workflowTriggerWorkspaceService.runWorkflowVersion(
      workflowVersionId,
      payload ?? {},
      workspaceMemberId,
      user,
    );
  }
}
