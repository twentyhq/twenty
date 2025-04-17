import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { DeleteWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/delete-workflow-version-step-input.dto';
import { SubmitFormStepInput } from 'src/engine/core-modules/workflow/dtos/submit-form-step-input.dto';
import { UpdateWorkflowRunStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-run-step-input.dto';
import { UpdateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-step-input.dto';
import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-step.dto';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class WorkflowStepResolver {
  constructor(
    private readonly workflowVersionStepWorkspaceService: WorkflowVersionStepWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
  ) {}

  @Mutation(() => WorkflowActionDTO)
  async createWorkflowVersionStep(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input')
    input: CreateWorkflowVersionStepInput,
  ): Promise<WorkflowActionDTO> {
    return this.workflowVersionStepWorkspaceService.createWorkflowVersionStep({
      workspaceId,
      input,
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
      stepIdToDelete: stepId,
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

  @Mutation(() => WorkflowActionDTO)
  async updateWorkflowRunStep(
    @Args('input')
    { workflowRunId, step }: UpdateWorkflowRunStepInput,
  ): Promise<WorkflowActionDTO> {
    await this.workflowRunWorkspaceService.updateWorkflowRunStep({
      workflowRunId,
      step,
    });

    return step;
  }
}
