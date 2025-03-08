import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { DeleteWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/delete-workflow-version-step-input.dto';
import { SubmitFormStepInput } from 'src/engine/core-modules/workflow/dtos/submit-form-step-input.dto';
import { UpdateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-step-input.dto';
import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-step.dto';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.workspace-service';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class WorkflowVersionStepResolver {
  constructor(
    private readonly workflowVersionStepWorkspaceService: WorkflowVersionStepWorkspaceService,
  ) {}

  @Mutation(() => WorkflowActionDTO)
  async createWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input')
    { stepType, workflowVersionId }: CreateWorkflowVersionStepInput,
  ): Promise<WorkflowActionDTO> {
    return this.workflowVersionStepWorkspaceService.createWorkflowVersionStep({
      workspaceId,
      workflowVersionId,
      stepType,
    });
  }

  @Mutation(() => WorkflowActionDTO)
  async updateWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input')
    { step, workflowVersionId }: UpdateWorkflowVersionStepInput,
  ): Promise<WorkflowActionDTO> {
    return this.workflowVersionStepWorkspaceService.updateWorkflowVersionStep({
      workspaceId,
      workflowVersionId,
      step,
    });
  }

  @Mutation(() => WorkflowActionDTO)
  async deleteWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input')
    { stepId, workflowVersionId }: DeleteWorkflowVersionStepInput,
  ): Promise<WorkflowActionDTO> {
    return this.workflowVersionStepWorkspaceService.deleteWorkflowVersionStep({
      workspaceId,
      workflowVersionId,
      stepId,
    });
  }

  @Mutation(() => Boolean)
  async submitFormStep(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input')
    { stepId, workflowRunId, response }: SubmitFormStepInput,
  ) {
    await this.workflowVersionStepWorkspaceService.submitFormStep({
      workspaceId,
      stepId,
      workflowRunId,
      response,
    });

    return true;
  }
}
