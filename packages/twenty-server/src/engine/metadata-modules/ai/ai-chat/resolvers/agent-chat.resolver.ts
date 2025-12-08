import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentMessageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message.dto';
import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@Resolver()
export class AgentChatResolver {
  constructor(private readonly agentChatService: AgentChatService) {}

  @Query(() => [AgentChatThreadDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async chatThreads(@AuthUserWorkspaceId() userWorkspaceId: string) {
    return this.agentChatService.getThreadsForUser(userWorkspaceId);
  }

  @Query(() => AgentChatThreadDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async chatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.agentChatService.getThreadById(id, userWorkspaceId);
  }

  @Query(() => [AgentMessageDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async chatMessages(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.agentChatService.getMessagesForThread(
      threadId,
      userWorkspaceId,
    );
  }

  @Mutation(() => AgentChatThreadDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async createChatThread(@AuthUserWorkspaceId() userWorkspaceId: string) {
    return this.agentChatService.createThread(userWorkspaceId);
  }
}
