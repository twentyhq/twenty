import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateAgentHandoffInput } from 'src/engine/metadata-modules/agent/dtos/create-agent-handoff.input';
import { RemoveAgentHandoffInput } from 'src/engine/metadata-modules/agent/dtos/remove-agent-handoff.input';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

import { AgentHandoffService } from './agent-handoff.service';
import { AgentService } from './agent.service';

import { AgentHandoffDTO } from './dtos/agent-handoff.dto';
import { AgentIdInput } from './dtos/agent-id.input';
import { AgentDTO } from './dtos/agent.dto';
import { CreateAgentInput } from './dtos/create-agent.input';
import { UpdateAgentInput } from './dtos/update-agent.input';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@Resolver()
export class AgentResolver {
  constructor(
    private readonly agentService: AgentService,
    private readonly agentHandoffService: AgentHandoffService,
  ) {}

  @Query(() => [AgentDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async findManyAgents(@AuthWorkspace() { id: workspaceId }: WorkspaceEntity) {
    return this.agentService.findManyAgents(workspaceId);
  }

  @Query(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async findOneAgent(
    @Args('input') { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentService.findOneAgent(id, workspaceId);
  }

  @Query(() => [AgentDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async findAgentHandoffTargets(
    @Args('input') { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentHandoffService.getHandoffTargets({
      fromAgentId: id,
      workspaceId,
    });
  }

  @Query(() => [AgentHandoffDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async findAgentHandoffs(
    @Args('input') { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentHandoffService.getAgentHandoffs({
      fromAgentId: id,
      workspaceId,
    });
  }

  @Mutation(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async createOneAgent(
    @Args('input') input: CreateAgentInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentService.createOneAgent(
      { ...input, isCustom: true },
      workspaceId,
    );
  }

  @Mutation(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async updateOneAgent(
    @Args('input') input: UpdateAgentInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentService.updateOneAgent(input, workspaceId);
  }

  @Mutation(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async deleteOneAgent(
    @Args('input') { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentService.deleteOneAgent(id, workspaceId);
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async createAgentHandoff(
    @Args('input') input: CreateAgentHandoffInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.agentHandoffService.createHandoff({
      fromAgentId: input.fromAgentId,
      toAgentId: input.toAgentId,
      workspaceId,
      description: input.description,
    });

    return true;
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async removeAgentHandoff(
    @Args('input') input: RemoveAgentHandoffInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.agentHandoffService.removeHandoff({
      fromAgentId: input.fromAgentId,
      toAgentId: input.toAgentId,
      workspaceId,
    });

    return true;
  }
}
