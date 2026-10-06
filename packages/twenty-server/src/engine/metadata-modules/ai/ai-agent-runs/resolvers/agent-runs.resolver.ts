import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Int, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AgentRunDTO } from 'src/engine/metadata-modules/ai/ai-agent-runs/dtos/agent-run.dto';
import { AgentRunsService } from 'src/engine/metadata-modules/ai/ai-agent-runs/services/agent-runs.service';

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS),
)
@MetadataResolver(() => AgentRunDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class AgentRunsResolver {
  constructor(private readonly agentRunsService: AgentRunsService) {}

  @Query(() => [AgentRunDTO])
  async agentRuns(
    @Args('agentId', { type: () => UUIDScalarType }) agentId: string,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentRunDTO[]> {
    return this.agentRunsService.findAgentRuns({ workspaceId, agentId, limit });
  }
}
