import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { RunWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/run-workflow-version-input.dto';
import { WorkflowTriggerResultDTO } from 'src/engine/core-modules/workflow/dtos/workflow-trigger-result.dto';
import { workflowTriggerGraphqlApiExceptionHandler } from 'src/engine/core-modules/workflow/utils/workflow-trigger-graphql-api-exception-handler.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { WorkflowTriggerService } from 'src/modules/workflow/workflow-trigger/workflow-trigger.service';

@UseGuards(JwtAuthGuard)
@Resolver()
export class WorkflowTriggerResolver {
  constructor(
    private readonly workflowTriggerService: WorkflowTriggerService,
  ) {}

  @Mutation(() => Boolean)
  async enableWorkflowTrigger(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('workflowVersionId') workflowVersionId: string,
  ) {
    try {
      return await this.workflowTriggerService.enableWorkflowTrigger(
        workspaceId,
        workflowVersionId,
      );
    } catch (error) {
      workflowTriggerGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => WorkflowTriggerResultDTO)
  async runWorkflowVersion(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input') { workflowVersionId, payload }: RunWorkflowVersionInput,
  ) {
    try {
      return {
        result: await this.workflowTriggerService.runWorkflowVersion(
          workspaceId,
          workflowVersionId,
          payload ?? {},
        ),
      };
    } catch (error) {
      workflowTriggerGraphqlApiExceptionHandler(error);
    }
  }
}
