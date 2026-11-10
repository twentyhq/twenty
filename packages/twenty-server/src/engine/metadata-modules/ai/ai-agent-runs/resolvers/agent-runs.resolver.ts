import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Int, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { AgentRunDTO } from 'src/engine/metadata-modules/ai/ai-agent-runs/dtos/agent-run.dto';
import { AgentRunsService } from 'src/engine/metadata-modules/ai/ai-agent-runs/services/agent-runs.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: true,
    },
    requiredPermissionFlags: [PermissionFlagType.AI_SETTINGS],
  }),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@MetadataResolver(() => AgentRunDTO)
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
export class AgentRunsResolver {
  constructor(
    private readonly agentService: AgentService,
    private readonly agentRunsService: AgentRunsService,
  ) {}

  @Query(() => [AgentRunDTO])
  @UseGuards(ApplicationTargetGuard)
  async agentRuns(
    @ApplicationTargetArg(
      'agentId',
      {
        kind: 'applicationOwnedEntity',
        metadataName: 'agent',
        requireApplicationRegistrationOwnership: false,
      },
      { type: () => UUIDScalarType },
    )
    agentId: string,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<AgentRunDTO[]> {
    // The application target guard lets unknown ids through, and turns outlive
    // their agent, so a deleted agent's runs would otherwise reach any app
    await this.agentService.findOneAgentById({ id: agentId, workspaceId });

    return this.agentRunsService.findAgentRuns({
      workspaceId,
      workspaceMemberId,
      agentId,
      limit,
    });
  }
}
