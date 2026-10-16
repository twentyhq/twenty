import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AgentMessageReactionSummaryDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message-reaction-summary.dto';
import { AgentChatMessageReactionService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-message-reaction.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  }),
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(AuthGraphqlApiExceptionFilter)
@MetadataResolver(() => AgentMessageReactionSummaryDTO)
export class AgentChatMessageReactionResolver {
  constructor(
    private readonly messageReactionService: AgentChatMessageReactionService,
  ) {}

  @Mutation(() => [AgentMessageReactionSummaryDTO])
  async addAgentChatMessageReaction(
    @Args('messageId', { type: () => UUIDScalarType }) messageId: string,
    @Args('emoji', { type: () => String }) emoji: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentMessageReactionSummaryDTO[]> {
    return this.messageReactionService.addReaction({
      messageId,
      emoji,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Mutation(() => [AgentMessageReactionSummaryDTO])
  async removeAgentChatMessageReaction(
    @Args('messageId', { type: () => UUIDScalarType }) messageId: string,
    @Args('emoji', { type: () => String }) emoji: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentMessageReactionSummaryDTO[]> {
    return this.messageReactionService.removeReaction({
      messageId,
      emoji,
      workspaceMemberId,
      workspaceId,
    });
  }
}
