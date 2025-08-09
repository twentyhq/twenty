import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AiAgentConfig } from 'src/engine/core-modules/ai-agent-config/ai-agent-config.entity';
import { AiAgentConfigService } from 'src/engine/core-modules/ai-agent-config/ai-agent-config.service';
import { AiAgentConfigFilterInput } from 'src/engine/core-modules/ai-agent-config/dtos/ai-agent-config-filter.input';
import { CreateAiAgentConfigInput } from 'src/engine/core-modules/ai-agent-config/dtos/create-ai-agent-config.input';
import { UpdateAiAgentConfigInput } from 'src/engine/core-modules/ai-agent-config/dtos/update-ai-agent-config.input';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => AiAgentConfig)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class AiAgentConfigResolver {
  constructor(
    private readonly aiAgentConfigService: AiAgentConfigService,
  ) {}

  @Query(() => AiAgentConfig, { nullable: true })
  async aiAgentConfig(
    @Args('filter') filter: AiAgentConfigFilterInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<AiAgentConfig | null> {
    return this.aiAgentConfigService.findOne(filter, workspace.id);
  }

  @Mutation(() => AiAgentConfig)
  async createAiAgentConfig(
    @Args('input') input: CreateAiAgentConfigInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<AiAgentConfig> {
    return this.aiAgentConfigService.create(input, workspace.id);
  }

  @Mutation(() => AiAgentConfig)
  async updateAiAgentConfig(
    @Args('id') id: string,
    @Args('input') input: UpdateAiAgentConfigInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<AiAgentConfig> {
    return this.aiAgentConfigService.update(id, input, workspace.id);
  }

  @Mutation(() => Boolean)
  async deleteAiAgentConfig(
    @Args('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    return this.aiAgentConfigService.delete(id, workspace.id);
  }
} 