import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
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
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AgentMessageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message.dto';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import { FileAttachmentInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/file-attachment.input';
import { AiSystemPromptPreviewDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-system-prompt-preview.dto';
import { ChatStreamCatchupChunksDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-stream-catchup-chunks.dto';
import { SendChatMessageResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-chat-message-result.dto';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
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
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';

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
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  BillingGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
@MetadataResolver(() => AgentChatThreadDTO)
export class AgentChatResolver {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly threadService: AgentChatThreadService,
    private readonly sharingService: AgentChatSharingService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly systemPromptBuilderService: SystemPromptBuilderService,
    private readonly turnPreflightService: AgentChatTurnPreflightService,
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
    private readonly turnRecorderService: AgentTurnRecorderService,
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

  @Query(() => [AgentMessageDTO])
  async chatMessages(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,

    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatService.getMessagesForThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Query(() => ChatStreamCatchupChunksDTO)
  async chatStreamCatchupChunks(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,

    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const thread = await this.sharingService.getReadableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    await this.reapDeadStream(thread, workspaceId);

    const { chunks, maxSeq } =
      await this.eventPublisherService.getAccumulatedChunks(threadId);

    const turnError = await this.turnRecorderService.findLatestTurnError({
      workspaceId,
      threadId,
    });

    return {
      chunks,
      maxSeq,
      error: turnError
        ? { code: turnError.code, message: turnError.message }
        : null,
    };
  }

  @Mutation(() => AgentChatThreadDTO)
  async createChatThread(
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.threadService.createThread({
      workspaceMemberId,
      workspaceId: workspace.id,
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
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendChatMessageResultDTO> {
    const sentMessage = await this.sendChatMessageToThread({
      threadId,
      text,
      messageId,
      browsingContext,
      modelId,
      fileAttachments,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
    });

    const mentionedParticipantWorkspaceMemberIds =
      await this.threadService.addMentionedParticipants({
        threadId,
        workspaceMemberId,
        workspaceId: workspace.id,
        mentionedWorkspaceMemberIds: mentionedWorkspaceMemberIds ?? [],
      });

    return { ...sentMessage, mentionedParticipantWorkspaceMemberIds };
  }

  private async sendChatMessageToThread({
    threadId,
    text,
    messageId,
    browsingContext,
    modelId,
    fileAttachments,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
  }: {
    threadId: string;
    text: string;
    messageId: string;
    browsingContext: BrowsingContextType | null;
    modelId: string | undefined;
    fileAttachments: FileAttachmentInput[] | null;
    userWorkspaceId: string;
    workspaceMemberId: string;
    workspace: WorkspaceEntity;
  }): Promise<SendChatMessageResultDTO> {
    const thread = await this.turnPreflightService.assertCanStartChatTurn({
      threadId,
      modelId,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
    });

    if (isDefined(thread.deletedAt)) {
      await this.sharingService.restoreThreadWithAccess({
        threadId,
        workspaceMemberId,
        workspaceId: workspace.id,
      });
    }

    await this.reapDeadStream(thread, workspace.id);

    if (isNonEmptyString(thread.activeStreamId)) {
      const queuedMessage = await this.agentChatService.queueMessage({
        threadId,
        text,
        id: messageId,
        fileAttachments: fileAttachments ?? undefined,
        workspaceId: workspace.id,
        userWorkspaceId,
        workspaceMemberId,
      });

      await this.eventPublisherService.publish({
        threadId,
        workspaceId: workspace.id,
        event: { type: 'queue-updated' },
      });

      return { messageId: queuedMessage.id, queued: true };
    }

    const result = await this.agentChatStreamingService.streamAgentChat({
      thread,
      browsingContext: browsingContext ?? null,
      modelId,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
      text,
      messageId,
      fileAttachments: fileAttachments ?? undefined,
    });

    if (result.queued) {
      await this.eventPublisherService.publish({
        threadId,
        workspaceId: workspace.id,
        event: { type: 'queue-updated' },
      });

      return { messageId: result.messageId, queued: true };
    }

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
    const message = await this.agentChatService.findQueuedMessage({
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
    const deleted = await this.agentChatService.deleteQueuedMessage({
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
    return this.systemPromptBuilderService.buildPreview(
      workspace.id,
      userWorkspaceId,
      workspace.aiAdditionalInstructions ?? undefined,
    );
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

  // the caller reads the thread after this, so it sees the reaped stream as released
  private async reapDeadStream(
    thread: AgentChatThreadWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const interruptedError = await this.streamRecoveryService.reapDeadStream({
      thread,
      workspaceId,
    });

    if (isDefined(interruptedError)) {
      thread.activeStreamId = null;
    }
  }
}
