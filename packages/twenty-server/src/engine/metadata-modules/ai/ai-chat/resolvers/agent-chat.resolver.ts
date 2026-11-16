import { AgentChatDirectMessageIdentityService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-direct-message-identity.service';
import { AgentChatMemberMessageSenderService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-member-message-sender.service';
import { AgentChatQueueService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-queue.service';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Args,
  Float,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import { FileAttachmentInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/file-attachment.input';
import { AiSystemPromptPreviewDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-system-prompt-preview.dto';
import { SendChatMessageResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-chat-message-result.dto';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { BillingGraphqlApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-graphql-api-exception.filter';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
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
      apiKey: false,
      oauthClient: { withUser: true, withoutUser: false },
      application: { withUser: true, withoutUser: false },
    },
    requiredPermissionFlags: [PermissionFlagType.AI],
  }),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  BillingGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
@MetadataResolver(() => AgentChatThreadDTO)
export class AgentChatResolver {
  constructor(
    private readonly agentChatQueueService: AgentChatQueueService,
    private readonly threadService: AgentChatThreadService,
    private readonly sharingService: AgentChatSharingService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly systemPromptBuilderService: SystemPromptBuilderService,
    private readonly turnPreflightService: AgentChatTurnPreflightService,
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
    private readonly memberMessageSenderService: AgentChatMemberMessageSenderService,
    private readonly directMessageIdentityService: AgentChatDirectMessageIdentityService,
  ) {}

  @Query(() => AgentChatThreadDTO)
  async chatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,

    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.sharingService.getReadableThread({
      threadId: id,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Mutation(() => UUIDScalarType)
  async openDirectMessage(
    @Args('workspaceMemberId', { type: () => UUIDScalarType })
    peerWorkspaceMemberId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string> {
    return this.directMessageIdentityService.open({
      workspaceId,
      firstWorkspaceMemberId: workspaceMemberId,
      secondWorkspaceMemberId: peerWorkspaceMemberId,
    });
  }

  @Mutation(() => AgentChatThreadDTO)
  async createChatThread(
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('channelId', { type: () => UUIDScalarType, nullable: true })
    channelId?: string | null,
  ) {
    return this.threadService.createThread({
      workspaceMemberId,
      workspaceId: workspace.id,
      channelId: channelId ?? undefined,
    });
  }

  @Mutation(() => SendChatMessageResultDTO)
  async sendChatMessage(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('text') text: string,
    @Args('messageId', { type: () => UUIDScalarType }) messageId: string,
    @Args('browsingContext', { type: () => GraphQLJSON, nullable: true })
    browsingContext: BrowsingContextType | null,
    @Args('modelId', { type: () => String, nullable: true })
    modelId: string | undefined,
    @Args('fileAttachments', {
      type: () => [FileAttachmentInput],
      nullable: true,
    })
    fileAttachments: FileAttachmentInput[] | null,
    @Args('mentionedWorkspaceMemberIds', {
      type: () => [UUIDScalarType],
      nullable: true,
    })
    mentionedWorkspaceMemberIds: string[] | null,
    // First message only: null files the chat in no channel, omitted keeps its channel
    @Args('channelId', { type: () => UUIDScalarType, nullable: true })
    channelId: string | null | undefined,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('shouldAssistantReply', { type: () => Boolean, nullable: true })
    shouldAssistantReply?: boolean | null,
    @Args('isAssistantParticipant', { type: () => Boolean, nullable: true })
    isAssistantParticipant?: boolean | null,
    @Args('isAssistantMentioned', { type: () => Boolean, nullable: true })
    isAssistantMentioned?: boolean | null,
    @Args('recipientWorkspaceMemberIds', {
      type: () => [UUIDScalarType],
      nullable: true,
    })
    recipientWorkspaceMemberIds?: string[] | null,
  ): Promise<SendChatMessageResultDTO> {
    const result = await this.memberMessageSenderService.sendMemberMessage({
      actor: { workspaceId: workspace.id, workspaceMemberId, userWorkspaceId },
      target: { threadId, channelId },
      message: {
        id: messageId,
        text,
        attachments: fileAttachments ?? undefined,
      },
      addressing: {
        mentionedWorkspaceMemberIds: mentionedWorkspaceMemberIds ?? [],
        initialRecipientWorkspaceMemberIds: recipientWorkspaceMemberIds ?? [],
      },
      assistant: {
        isMentioned: isAssistantMentioned ?? false,
        isInitiallyIncluded: isAssistantParticipant ?? true,
        isReplyRequested: shouldAssistantReply ?? true,
      },
      execution: { modelId, browsingContext: browsingContext ?? null },
    });

    if (isDefined(result.streamId) && isDefined(result.turnId)) {
      tagAiChatStreamScope({
        streamId: result.streamId,
        turnId: result.turnId,
        threadId,
        workspaceId: workspace.id,
      });
    }

    return {
      messageId: result.messageId,
      queued: result.isQueued,
      streamId: result.streamId,
      mentionedParticipantWorkspaceMemberIds:
        result.delivery.deliveredMentionWorkspaceMemberIds,
      recipientParticipantWorkspaceMemberIds:
        result.delivery.deliveredRecipientWorkspaceMemberIds,
    };
  }

  @Mutation(() => SendChatMessageResultDTO)
  async retryChatMessage(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('modelId', { type: () => String, nullable: true })
    modelId: string | undefined,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendChatMessageResultDTO> {
    await this.turnPreflightService.assertCanStartChatTurn({
      threadId,
      modelId,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
    });

    const result = await this.agentChatStreamingService.retryLastFailedTurn({
      threadId,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
      modelId,
    });

    tagAiChatStreamScope({
      streamId: result.streamId,
      turnId: result.turnId,
      threadId,
      workspaceId: workspace.id,
    });

    return {
      messageId: result.messageId,
      queued: false,
      streamId: result.streamId,
    };
  }

  @Mutation(() => Boolean)
  async stopAgentChatStream(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,

    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    const thread = await this.threadService.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    await this.threadLifecycleService.stopStreamIfAny({ workspaceId, thread });

    return true;
  }

  @Mutation(() => Boolean)
  async deleteQueuedChatMessage(
    @Args('messageId', { type: () => UUIDScalarType }) messageId: string,

    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const message = await this.agentChatQueueService.findQueuedMessage({
      messageId,
      workspaceId: workspace.id,
    });

    if (!isDefined(message)) {
      throw new AiException(
        'Queued message not found',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }

    await this.threadService.getWritableThread({
      threadId: message.threadId,
      workspaceMemberId,
      workspaceId: workspace.id,
    });
    const deleted = await this.agentChatQueueService.deleteQueuedMessage({
      messageId,
      workspaceId: workspace.id,
    });

    if (deleted) {
      await this.eventPublisherService.publish({
        threadId: message.threadId,
        workspaceId: workspace.id,
        event: { type: 'queue-updated' },
      });
    }

    return deleted;
  }

  @Query(() => AiSystemPromptPreviewDTO)
  async getAiSystemPromptPreview(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.systemPromptBuilderService.buildPreview({
      workspaceId: workspace.id,
      userWorkspaceId,
      workspaceInstructions: workspace.aiAdditionalInstructions ?? undefined,
      assistantProfile: workspace.aiChatAssistantProfile,
    });
  }

  @ResolveField(() => Date)
  createdAt(@Parent() thread: AgentChatThreadWorkspaceEntity): Date {
    return new Date(thread.createdAt);
  }

  @ResolveField(() => Date)
  updatedAt(@Parent() thread: AgentChatThreadWorkspaceEntity): Date {
    return new Date(thread.updatedAt);
  }

  @ResolveField(() => Date, { nullable: true })
  deletedAt(@Parent() thread: AgentChatThreadWorkspaceEntity): Date | null {
    return isDefined(thread.deletedAt) ? new Date(thread.deletedAt) : null;
  }

  @ResolveField(() => Float)
  totalInputCredits(@Parent() thread: AgentChatThreadWorkspaceEntity): number {
    return toDisplayCredits(Number(thread.totalInputCredits));
  }

  @ResolveField(() => Float)
  totalOutputCredits(@Parent() thread: AgentChatThreadWorkspaceEntity): number {
    return toDisplayCredits(Number(thread.totalOutputCredits));
  }
}
