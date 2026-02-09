import { UseGuards } from '@nestjs/common';
import {
  Args,
  Float,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { toDisplayCredits } from 'src/engine/core-modules/billing/utils/to-display-credits.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentMessageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message.dto';
import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import { AISystemPromptPreviewDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-system-prompt-preview.dto';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@Resolver(() => AgentChatThreadDTO)
export class AgentChatResolver {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly systemPromptBuilderService: SystemPromptBuilderService,
  ) {}

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

  @Query(() => AISystemPromptPreviewDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async getAISystemPromptPreview(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.systemPromptBuilderService.buildPreview(
      workspace.id,
      userWorkspaceId,
      workspace.aiAdditionalInstructions ?? undefined,
    );
  }

  @ResolveField(() => Float)
  totalInputCredits(@Parent() thread: AgentChatThreadEntity): number {
    return toDisplayCredits(thread.totalInputCredits);
  }

  @ResolveField(() => Float)
  totalOutputCredits(@Parent() thread: AgentChatThreadEntity): number {
    return toDisplayCredits(thread.totalOutputCredits);
  }
}
