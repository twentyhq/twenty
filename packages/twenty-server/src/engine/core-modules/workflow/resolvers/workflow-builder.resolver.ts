import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';

import graphqlTypeJson from 'graphql-type-json';

import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';
import { OutputSchema } from 'src/modules/workflow/workflow-executor/types/workflow-step-settings.type';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ComputeStepOutputSchemaInput } from 'src/engine/core-modules/workflow/dtos/compute-step-output-schema-input.dto';
import { WorkflowBuilderService } from 'src/modules/workflow/workflow-builder/workflow-builder.service';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
@UseFilters(WorkflowTriggerGraphqlApiExceptionFilter)
export class WorkflowBuilderResolver {
  constructor(
    private readonly workflowBuilderService: WorkflowBuilderService,
  ) {}

  @Mutation(() => graphqlTypeJson)
  async computeStepOutputSchema(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input') { step }: ComputeStepOutputSchemaInput,
  ): Promise<OutputSchema> {
    return this.workflowBuilderService.computeStepOutputSchema({
      step,
      workspaceId,
    });
  }
}
