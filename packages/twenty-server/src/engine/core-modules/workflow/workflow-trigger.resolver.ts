import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { RunWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/run-workflow-version-input.dto';
import { WorkflowRunDTO } from 'src/engine/core-modules/workflow/dtos/workflow-run.dto';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/services/workflow-trigger.workspace-service';

@Resolver()
@UseGuards(JwtAuthGuard)
@UseFilters(WorkflowTriggerGraphqlApiExceptionFilter)
export class WorkflowTriggerResolver {
  constructor(
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  @Mutation(() => Boolean)
  async enableWorkflowTrigger(
    @Args('workflowVersionId') workflowVersionId: string,
  ) {
    return await this.workflowTriggerWorkspaceService.enableWorkflowTrigger(
      workflowVersionId,
    );
  }

  @Mutation(() => WorkflowRunDTO)
  async runWorkflowVersion(
    @Args('input') { workflowVersionId, payload }: RunWorkflowVersionInput,
  ) {
    return await this.workflowTriggerWorkspaceService.runWorkflowVersion(
      workflowVersionId,
      payload ?? {},
    );
  }
}
