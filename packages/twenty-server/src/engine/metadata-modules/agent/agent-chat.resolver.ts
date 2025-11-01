import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentChatService } from 'src/engine/metadata-modules/agent/agent-chat.service';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

import { AgentChatMessageDTO } from './dtos/agent-chat-message.dto';
import { AgentChatThreadDTO } from './dtos/agent-chat-thread.dto';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionsGuard(PermissionFlagType.AI),
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

  @Query(() => [AgentChatMessageDTO])
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
