import { Mutation, Resolver } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';

import graphqlTypeJson from 'graphql-type-json';

import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkflowTriggerGraphqlApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-graphql-api-exception.filter';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
@UseFilters(WorkflowTriggerGraphqlApiExceptionFilter)
export class WorkflowResolver {
  @Mutation(() => graphqlTypeJson)
  async computeStepSettings() {
    return {};
  }
}
