import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { ComputeStepOutputSchemaInput } from 'src/engine/core-modules/workflow/dtos/compute-step-output-schema-input.dto';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
@UseFilters(WorkflowTriggerGraphqlApiExceptionFilter)
export class WorkflowBuilderResolver {
  constructor(
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
  ) {}

  @Mutation(() => graphqlTypeJson)
  async computeStepOutputSchema(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input') { step }: ComputeStepOutputSchemaInput,
  ): Promise<OutputSchema> {
    return this.workflowSchemaWorkspaceService.computeStepOutputSchema({
      step,
      workspaceId,
    });
  }
}
