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
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentMessageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message.dto';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { AgentChatQuestionAnswerInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-question-answer.input';
import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import { AgentChatThreadStatus } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-thread-status.enum';
import { AgentChatThreadParticipantDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-participant.dto';
import { AgentChatThreadReadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-read.dto';
import { FileAttachmentInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/file-attachment.input';
import { AiSystemPromptPreviewDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-system-prompt-preview.dto';
import { ChatStreamCatchupChunksDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-stream-catchup-chunks.dto';
import { SendChatMessageResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-chat-message-result.dto';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';
import { AgentRunThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-run-thread.service';
import { type AgentChatThreadLastMessageSummary } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-last-message-summary.type';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadReadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-read.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';
import { buildThreadWorkerWhere } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-thread-worker-where.util';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { BillingGraphqlApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-graphql-api-exception.filter';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { getChatModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/get-chat-model-id.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

type ThreadWithOptionalLastMessageSummary = AgentChatThreadEntity &
  Partial<AgentChatThreadLastMessageSummary>;

@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
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
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly agentChatThreadParticipantService: AgentChatThreadParticipantService,
    private readonly agentChatThreadReadService: AgentChatThreadReadService,
    private readonly agentChatChannelService: AgentChatChannelService,
    private readonly agentRunThreadService: AgentRunThreadService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly systemPromptBuilderService: SystemPromptBuilderService,
    private readonly aiBillingService: AiBillingService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly redisClientService: RedisClientService,
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
  ) {}

  @Query(() => [AgentChatThreadDTO])
  @AllowSuspendedWorkspace()
  async chatThreads(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatService.getThreadsForUser({
      userWorkspaceId,
      workspaceId,
    });
  }

  @Query(() => AgentChatThreadDTO)
  async chatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatService.getThreadById({
      threadId: id,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Query(() => [AgentMessageDTO])
  async chatMessages(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatService.getMessagesForThread({
      threadId,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Query(() => [AgentChatThreadParticipantDTO])
  async chatThreadParticipants(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatThreadParticipantService.getParticipantsForThread({
      threadId,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Query(() => [AgentChatThreadReadDTO])
  async chatThreadReads(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatThreadReadService.getReadsForThread({
      threadId,
      userWorkspaceId,
      workspaceId,
    });
  }

  // One call for a whole list: the alternative is a cursor per thread, which
  // is a query per row on every inbox render.
  @Query(() => [UUIDScalarType])
  async unreadChatThreadIds(
    @Args('threadIds', { type: () => [UUIDScalarType] }) threadIds: string[],
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatThreadReadService.getUnreadThreadIds({
      threadIds,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatThreadReadDTO)
  async markChatThreadRead(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const read = await this.agentChatThreadReadService.markThreadRead({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    // Everyone on the thread sees the tick move, the same way they see a new
    // message: a receipt nobody else is told about is not a receipt.
    await this.eventPublisherService.publish({
      threadId,
      workspaceId,
      event: { type: 'reads-updated' },
    });

    return read;
  }

  @Mutation(() => AgentChatThreadParticipantDTO)
  async addChatThreadParticipant(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('userWorkspaceId', { type: () => UUIDScalarType })
    userWorkspaceId: string,
    @AuthUserWorkspaceId() actorUserWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatThreadParticipantService.addParticipant({
      threadId,
      actorUserWorkspaceId,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => Boolean)
  async removeChatThreadParticipant(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('userWorkspaceId', { type: () => UUIDScalarType })
    userWorkspaceId: string,
    @AuthUserWorkspaceId() actorUserWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    return this.agentChatThreadParticipantService.removeParticipant({
      threadId,
      actorUserWorkspaceId,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Query(() => ChatStreamCatchupChunksDTO)
  async chatStreamCatchupChunks(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const thread = await this.agentChatService.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    const interruptedError =
      await this.agentChatStreamingService.reapDeadStream({
        thread,
        workspaceId,
      });

    if (interruptedError) {
      thread.activeStreamId = null;
      thread.lastStreamError = interruptedError;
    }

    const { chunks, maxSeq } =
      await this.eventPublisherService.getAccumulatedChunks(threadId);

    return {
      chunks,
      maxSeq,
      error: thread.lastStreamError
        ? {
            code: thread.lastStreamError.code,
            message: thread.lastStreamError.message,
          }
        : null,
    };
  }

  @Mutation(() => AgentChatThreadDTO)
  async createChatThread(
    @Args('channelId', { type: () => UUIDScalarType, nullable: true })
    channelId: string | null,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (isDefined(channelId)) {
      await this.agentChatChannelService.getAccessibleChannelById({
        channelId,
        userWorkspaceId,
        workspaceId: workspace.id,
      });
    }

    return this.agentChatService.createThread({
      userWorkspaceId,
      workspaceId: workspace.id,
      channelId,
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
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendChatMessageResultDTO> {
    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AiException(
        'No AI models are available. Configure at least one AI provider.',
        AiExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    const resolvedModelId = getChatModelId({
      requestedModelId: modelId,
      workspace,
    });

    this.aiModelRegistryService.validateModelAvailability(resolvedModelId);

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId: workspace.id,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId },
    });

    // A public channel is readable by the whole workspace, but talking in one
    // is joining the conversation, so writing takes the worker gate the same
    // way status and assignment do. Joining the channel is one click.
    const thread = await this.threadRepository.findOne(workspace.id, {
      where: buildThreadWorkerWhere({ id: threadId, userWorkspaceId }),
    });

    if (!isDefined(thread)) {
      throw new AiException(
        'Join this channel to work on its chats',
        AiExceptionCode.THREAD_NOT_JOINED,
      );
    }

    if (isDefined(thread.deletedAt)) {
      await this.agentChatService.restoreArchivedThread({
        threadId,
        userWorkspaceId,
        workspaceId: workspace.id,
      });
    }

    // Recorded once the message exists, never before: a mention writes a
    // participant row, and a send that fails after it would leave somebody
    // named on a thread by a message nobody can read. The user message is
    // persisted as the send starts rather than when the answer lands, so the
    // thread still reaches their list while the assistant is still writing.
    const recordMentions = async () => {
      const mentionedUserWorkspaceIds =
        await this.agentChatThreadParticipantService.recordMentionsFromMessage({
          threadId,
          text,
          workspaceId: workspace.id,
        });

      if (mentionedUserWorkspaceIds.length > 0) {
        await this.agentChatService.broadcastThreadUpdated(thread, [
          'mentionedUserWorkspaceIds',
        ]);
      }
    };

    if (isDefined(thread.activeStreamId)) {
      const interruptedError =
        await this.agentChatStreamingService.reapDeadStream({
          thread,
          workspaceId: workspace.id,
        });

      if (interruptedError) {
        thread.activeStreamId = null;
        thread.lastStreamError = interruptedError;
      }
    }

    if (
      isDefined(thread.activeStreamId) ||
      isDefined(thread.pendingQuestionMessageId)
    ) {
      const queuedMessage = await this.agentChatService.queueMessage({
        threadId,
        text,
        id: messageId,
        fileAttachments: fileAttachments ?? undefined,
        workspaceId: workspace.id,
        userWorkspaceId,
      });

      await recordMentions();

      await this.eventPublisherService.publish({
        threadId,
        workspaceId: workspace.id,
        event: { type: 'queue-updated' },
      });

      return { messageId: queuedMessage.id, queued: true };
    }

    const result = await this.agentChatStreamingService.streamAgentChat({
      threadId,
      browsingContext: browsingContext ?? null,
      modelId,
      userWorkspaceId,
      workspace,
      text,
      messageId,
      fileAttachments: fileAttachments ?? undefined,
    });

    await recordMentions();

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
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendChatMessageResultDTO> {
    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AiException(
        'No AI models are available. Configure at least one AI provider.',
        AiExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    this.aiModelRegistryService.validateModelAvailability(
      getChatModelId({ requestedModelId: modelId, workspace }),
    );

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId: workspace.id,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId },
    });

    const result = await this.agentChatStreamingService.retryLastFailedTurn({
      threadId,
      userWorkspaceId,
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

  @Mutation(() => SendChatMessageResultDTO)
  async answerAgentChatQuestion(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('messageId', { type: () => UUIDScalarType }) messageId: string,
    @Args('answers', { type: () => [AgentChatQuestionAnswerInput] })
    answers: AgentChatQuestionAnswerInput[],
    @Args('modelId', { type: () => String, nullable: true })
    modelId: string | undefined,
    @Args('fileAttachments', {
      type: () => [FileAttachmentInput],
      nullable: true,
    })
    fileAttachments: FileAttachmentInput[] | null,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendChatMessageResultDTO> {
    // Answering is writing into the conversation, so it takes the same gate as
    // sending.
    const thread = await this.threadRepository.findOne(workspace.id, {
      where: buildThreadWorkerWhere({ id: threadId, userWorkspaceId }),
    });

    if (!isDefined(thread)) {
      throw new AiException(
        'Join this channel to work on its chats',
        AiExceptionCode.THREAD_NOT_JOINED,
      );
    }

    // A workflow run's question resumes the run, not a chat stream: the
    // agent's own model and the workflow's credits apply, not the chat's.
    if (isDefined(thread.workflowRunId)) {
      const answer = await this.agentRunThreadService.answerRunQuestion({
        thread,
        messageId,
        answers,
        userWorkspaceId,
      });

      return { messageId: answer.messageId, queued: false };
    }

    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AiException(
        'No AI models are available. Configure at least one AI provider.',
        AiExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    const resolvedModelId = getChatModelId({
      requestedModelId: modelId,
      workspace,
    });

    this.aiModelRegistryService.validateModelAvailability(resolvedModelId);

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId: workspace.id,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId },
    });

    const { streamId, turnId } =
      await this.agentChatStreamingService.answerPendingQuestionAndResumeStream(
        {
          threadId,
          messageId,
          answers,
          userWorkspaceId,
          workspace,
          modelId,
          fileAttachments: fileAttachments ?? undefined,
        },
      );

    tagAiChatStreamScope({
      streamId,
      turnId,
      threadId,
      workspaceId: workspace.id,
    });

    return { messageId, queued: false, streamId };
  }

  @Mutation(() => Boolean)
  async stopAgentChatStream(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: buildThreadWorkerWhere({ id: threadId, userWorkspaceId }),
    });

    if (!isDefined(thread) || !isDefined(thread.activeStreamId)) {
      return true;
    }

    const redis = this.redisClientService.getClient();

    await redis.publish(
      getCancelChannel(threadId, thread.activeStreamId),
      'cancel',
    );

    await this.threadRepository.update(
      workspaceId,
      { id: threadId, activeStreamId: thread.activeStreamId },
      { activeStreamId: null },
    );

    return true;
  }

  @Mutation(() => AgentChatThreadDTO)
  async renameChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @Args('title') title: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadEntity> {
    return this.agentChatService.updateThreadTitle({
      threadId: id,
      userWorkspaceId,
      workspaceId,
      title,
    });
  }

  @Mutation(() => AgentChatThreadDTO)
  async setChatThreadStatus(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @Args('status', { type: () => AgentChatThreadStatus })
    status: AgentChatThreadStatus,
    @Args('snoozedUntil', { type: () => Date, nullable: true })
    snoozedUntil: Date | null,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadEntity> {
    return this.agentChatService.setThreadStatus({
      threadId: id,
      status,
      snoozedUntil: snoozedUntil ?? null,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatThreadDTO)
  async assignChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @Args('assigneeUserWorkspaceId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    assigneeUserWorkspaceId: string | null,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadEntity> {
    return this.agentChatService.assignThread({
      threadId: id,
      assigneeUserWorkspaceId: assigneeUserWorkspaceId ?? null,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatThreadDTO)
  async archiveChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadEntity> {
    await this.cancelActiveStreamIfAny(id, userWorkspaceId, workspaceId);

    return this.agentChatService.archiveThread({
      threadId: id,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => AgentChatThreadDTO)
  async unarchiveChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadEntity> {
    return this.agentChatService.unarchiveThread({
      threadId: id,
      userWorkspaceId,
      workspaceId,
    });
  }

  @Mutation(() => Boolean)
  async deleteChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.cancelActiveStreamIfAny(id, userWorkspaceId, workspaceId);

    await this.agentChatService.hardDeleteThread({
      threadId: id,
      userWorkspaceId,
      workspaceId,
    });

    return true;
  }

  private async cancelActiveStreamIfAny(
    threadId: string,
    userWorkspaceId: string,
    workspaceId: string,
  ): Promise<void> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: buildThreadWorkerWhere({ id: threadId, userWorkspaceId }),
    });

    if (!isDefined(thread) || !isDefined(thread.activeStreamId)) {
      return;
    }

    const redis = this.redisClientService.getClient();

    await redis.publish(
      getCancelChannel(threadId, thread.activeStreamId),
      'cancel',
    );
  }

  @Mutation(() => Boolean)
  async deleteQueuedChatMessage(
    @Args('messageId', { type: () => UUIDScalarType }) messageId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
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

    // Dropping somebody's queued message is a write on the thread, so it takes
    // the same gate as status: a public channel is readable by the whole
    // workspace, and a reader passing by is not working this queue.
    const thread = await this.threadRepository.findOne(workspace.id, {
      where: buildThreadWorkerWhere({
        id: message.threadId,
        userWorkspaceId,
      }),
    });

    if (!isDefined(thread)) {
      throw new AiException(
        'Join this channel to work on its chats',
        AiExceptionCode.THREAD_NOT_JOINED,
      );
    }

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

  @ResolveField(() => UUIDScalarType)
  ownerUserWorkspaceId(@Parent() thread: AgentChatThreadEntity): string {
    return thread.userWorkspaceId;
  }

  @ResolveField(() => Float)
  totalInputCredits(@Parent() thread: AgentChatThreadEntity): number {
    return toDisplayCredits(thread.totalInputCredits);
  }

  @ResolveField(() => Float)
  totalOutputCredits(@Parent() thread: AgentChatThreadEntity): number {
    return toDisplayCredits(thread.totalOutputCredits);
  }

  @ResolveField('lastMessageAt', () => Date, { nullable: true })
  async lastMessageAt(
    @Parent() thread: ThreadWithOptionalLastMessageSummary,
  ): Promise<Date | null> {
    return (await this.getLastMessageSummary(thread)).lastMessageAt;
  }

  @ResolveField('lastMessagePreview', () => String, { nullable: true })
  async lastMessagePreview(
    @Parent() thread: ThreadWithOptionalLastMessageSummary,
  ): Promise<string | null> {
    return (await this.getLastMessageSummary(thread)).lastMessagePreview;
  }

  @ResolveField('lastMessageRole', () => String, { nullable: true })
  async lastMessageRole(
    @Parent() thread: ThreadWithOptionalLastMessageSummary,
  ): Promise<string | null> {
    return (await this.getLastMessageSummary(thread)).lastMessageRole;
  }

  @ResolveField('lastMessageAuthorUserWorkspaceId', () => UUIDScalarType, {
    nullable: true,
  })
  async lastMessageAuthorUserWorkspaceId(
    @Parent() thread: ThreadWithOptionalLastMessageSummary,
  ): Promise<string | null> {
    return (await this.getLastMessageSummary(thread))
      .lastMessageAuthorUserWorkspaceId;
  }

  // Lists precompute the summary in one query; a single thread fetches it.
  private async getLastMessageSummary(
    thread: ThreadWithOptionalLastMessageSummary,
  ): Promise<AgentChatThreadLastMessageSummary> {
    if (thread.lastMessageAt !== undefined) {
      return {
        lastMessageAt: thread.lastMessageAt ?? null,
        lastMessagePreview: thread.lastMessagePreview ?? null,
        lastMessageRole: thread.lastMessageRole ?? null,
        lastMessageAuthorUserWorkspaceId:
          thread.lastMessageAuthorUserWorkspaceId ?? null,
      };
    }

    return this.agentChatService.getLastMessageSummaryForThread({
      threadId: thread.id,
      workspaceId: thread.workspaceId,
    });
  }
}
