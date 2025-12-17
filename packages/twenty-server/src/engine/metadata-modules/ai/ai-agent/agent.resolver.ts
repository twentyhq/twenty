import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { fromFlatAgentWithRoleIdToAgentDto } from 'src/engine/metadata-modules/flat-agent/utils/from-agent-entity-to-agent-dto.util';
import { WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-graphql-api-exception.interceptor';

import { AgentService } from './agent.service';

import { AgentIdInput } from './dtos/agent-id.input';
import { AgentDTO } from './dtos/agent.dto';
import { CreateAgentInput } from './dtos/create-agent.input';
import { UpdateAgentInput } from './dtos/update-agent.input';
import { AgentGraphqlApiExceptionInterceptor } from './interceptors/agent-graphql-api-exception.interceptor';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(
  WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor,
  AgentGraphqlApiExceptionInterceptor,
)
@Resolver()
export class AgentResolver {
  constructor(private readonly agentService: AgentService) {}

  @Query(() => [AgentDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async findManyAgents(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentDTO[]> {
    const flatAgentsWithRoleId =
      await this.agentService.findManyAgents(workspaceId);

    return flatAgentsWithRoleId.map(fromFlatAgentWithRoleIdToAgentDto);
  }

  @Query(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async findOneAgent(
    @Args('input') { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentDTO> {
    const fatAgentWithRoleId = await this.agentService.findOneAgentById({
      workspaceId,
      id,
    });

    return fromFlatAgentWithRoleIdToAgentDto(fatAgentWithRoleId);
  }

  @Mutation(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async createOneAgent(
    @Args('input') input: CreateAgentInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentDTO> {
    const createdAgent = await this.agentService.createOneAgent(
      { ...input, isCustom: true },
      workspaceId,
    );

    return fromFlatAgentWithRoleIdToAgentDto(createdAgent);
  }

  @Mutation(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async updateOneAgent(
    @Args('input') input: UpdateAgentInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentDTO> {
    const updatedAgent = await this.agentService.updateOneAgent({
      input,
      workspaceId,
    });

    return fromFlatAgentWithRoleIdToAgentDto(updatedAgent);
  }

  @Mutation(() => AgentDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async deleteOneAgent(
    @Args('input') { id }: AgentIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentDTO> {
    const deletedFlatAgent = await this.agentService.deleteOneAgent(
      id,
      workspaceId,
    );

    return fromFlatAgentWithRoleIdToAgentDto(deletedFlatAgent);
  }
}
