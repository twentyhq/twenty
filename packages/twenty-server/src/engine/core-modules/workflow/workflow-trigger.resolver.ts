import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { RunWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/run-workflow-version-input.dto';
import { WorkflowTriggerResultDTO } from 'src/engine/core-modules/workflow/dtos/workflow-trigger-result.dto';
import { workflowTriggerGraphqlApiExceptionHandler } from 'src/engine/core-modules/workflow/utils/workflow-trigger-graphql-api-exception-handler.util';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workflow-trigger.workspace-service';

@UseGuards(JwtAuthGuard)
@Resolver()
export class WorkflowTriggerResolver {
  constructor(
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  @Mutation(() => Boolean)
  async enableWorkflowTrigger(
    @Args('workflowVersionId') workflowVersionId: string,
  ) {
    try {
      return await this.workflowTriggerWorkspaceService.enableWorkflowTrigger(
        workflowVersionId,
      );
    } catch (error) {
      workflowTriggerGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => WorkflowTriggerResultDTO)
  async runWorkflowVersion(
    @Args('input') { workflowVersionId, payload }: RunWorkflowVersionInput,
  ) {
    try {
      return {
        result: await this.workflowTriggerWorkspaceService.runWorkflowVersion(
          workflowVersionId,
          payload ?? {},
        ),
      };
    } catch (error) {
      workflowTriggerGraphqlApiExceptionHandler(error);
    }
  }
}
