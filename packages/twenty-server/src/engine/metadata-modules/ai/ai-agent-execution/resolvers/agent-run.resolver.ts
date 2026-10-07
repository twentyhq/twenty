import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { BillingGraphqlApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-graphql-api-exception.filter';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AgentRunStateDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-run-state.dto';
import { RunAgentInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent.input';
import { RunAgentResultDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent-result.dto';
import { RunAgentApiService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-api.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

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
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  BillingGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
// TODO(@abdulrahmancodes): install ResolverValidationPipe here; without it every
// class-validator decorator on RunAgentInputDTO is inert. Enabling it rejects the
// empty assistant turns the Slack app replays, so those callers go first.
@MetadataResolver()
export class AgentRunResolver {
  constructor(private readonly runAgentApiService: RunAgentApiService) {}

  @Mutation(() => RunAgentResultDTO)
  async runAgent(
    @Args('input') input: RunAgentInputDTO,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @AuthWorkspaceMemberId()
    workspaceMemberId: string | undefined,
  ): Promise<RunAgentResultDTO> {
    return this.runAgentApiService.run({
      workspace,
      requestUserWorkspaceId: userWorkspaceId ?? null,
      requestWorkspaceMemberId: workspaceMemberId ?? null,
      callerApplication,
      input,
    });
  }

  @Query(() => AgentRunStateDTO)
  async agentRun(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @AuthWorkspaceMemberId()
    workspaceMemberId: string | undefined,
  ): Promise<AgentRunStateDTO> {
    return this.runAgentApiService.findRun({
      workspaceId: workspace.id,
      runId: id,
      callerApplication,
      requestUserWorkspaceId: userWorkspaceId ?? null,
      requestWorkspaceMemberId: workspaceMemberId ?? null,
    });
  }
}
