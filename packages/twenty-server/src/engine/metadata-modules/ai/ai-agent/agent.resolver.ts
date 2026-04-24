import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isNonEmptyString } from '@sniptt/guards';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { fromFlatAgentWithRoleIdToAgentDto } from 'src/engine/metadata-modules/flat-agent/utils/from-agent-entity-to-agent-dto.util';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

import { AgentService } from './agent.service';

import { AgentIdInput } from './dtos/agent-id.input';
import { AgentDTO } from './dtos/agent.dto';
import { CreateAgentInput } from './dtos/create-agent.input';
import { UpdateAgentInput } from './dtos/update-agent.input';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  AiGraphqlApiExceptionInterceptor,
)
@MetadataResolver()
export class AgentResolver {
  constructor(
    private readonly agentService: AgentService,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  @Query(() => [AgentDTO])
  async findManyAgents(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentDTO[]> {
    const flatAgentsWithRoleId =
      await this.agentService.findManyAgents(workspaceId);

    return flatAgentsWithRoleId.map(fromFlatAgentWithRoleIdToAgentDto);
  }

  @Query(() => AgentDTO)
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
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async createOneAgent(
    @Args('input') input: CreateAgentInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AgentDTO> {
    if (isNonEmptyString(input.modelId)) {
      this.aiModelRegistryService.validateModelAvailability(
        input.modelId,
        workspace,
      );
    }

    const createdAgent = await this.agentService.createOneAgent(
      { ...input, isCustom: true },
      workspace.id,
    );

    return fromFlatAgentWithRoleIdToAgentDto(createdAgent);
  }

  @Mutation(() => AgentDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async updateOneAgent(
    @Args('input') input: UpdateAgentInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AgentDTO> {
    if (isNonEmptyString(input.modelId)) {
      this.aiModelRegistryService.validateModelAvailability(
        input.modelId,
        workspace,
      );
    }

    const updatedAgent = await this.agentService.updateOneAgent({
      input,
      workspaceId: workspace.id,
    });

    return fromFlatAgentWithRoleIdToAgentDto(updatedAgent);
  }

  @Mutation(() => AgentDTO)
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
