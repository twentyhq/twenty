import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentRoleService } from 'src/engine/metadata-modules/agent-role/agent-role.service';

import { AgentService } from './agent.service';

import { AgentIdInput } from './dtos/agent-id.input';
import { AgentDTO } from './dtos/agent.dto';
import { AssignRoleToAgentInput } from './dtos/assign-role-to-agent.input';
import { CreateAgentInput } from './dtos/create-agent.input';
import { UpdateAgentInput } from './dtos/update-agent.input';

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard)
@Resolver()
export class AgentResolver {
  constructor(
    private readonly agentService: AgentService,
    private readonly agentRoleService: AgentRoleService,
  ) {}

  @Query(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async findOneAgent(
    @Args('input') { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.agentService.findOneAgent(id, workspaceId);
  }

  @Query(() => [AgentDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async findManyAgents(@AuthWorkspace() { id: workspaceId }: Workspace) {
    return this.agentService.findManyAgents(workspaceId);
  }

  @Mutation(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async createOneAgent(
    @Args('input') input: CreateAgentInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.agentService.createOneAgent(input, workspaceId);
  }

  @Mutation(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async updateOneAgent(
    @Args('input') input: UpdateAgentInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.agentService.updateOneAgent(input, workspaceId);
  }

  @Mutation(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async deleteOneAgent(
    @Args('input') { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.agentService.deleteOneAgent(id, workspaceId);
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async assignRoleToAgent(
    @Args('input') input: AssignRoleToAgentInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    await this.agentRoleService.assignRoleToAgent({
      agentId: input.agentId,
      roleId: input.roleId,
      workspaceId,
    });

    return true;
  }
}
