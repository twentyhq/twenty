import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Args,
  Float,
  Int,
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
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { AgentChatQuestionAnswerInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-question-answer.input';
import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import {
  assertValidChatThreadsForRecordPagination,
  DEFAULT_CHAT_THREADS_FOR_RECORD_LIMIT,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/assert-valid-chat-threads-for-record-pagination.util';
import { FileAttachmentInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/file-attachment.input';
import { AiSystemPromptPreviewDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-system-prompt-preview.dto';
import { ChatStreamCatchupChunksDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-stream-catchup-chunks.dto';
import { SendChatMessageResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-chat-message-result.dto';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';
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
import { getChatModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/get-chat-model-id.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
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
    private readonly agentChatThreadTargetService: AgentChatThreadTargetService,
    private readonly sharingService: AgentChatSharingService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly systemPromptBuilderService: SystemPromptBuilderService,
    private readonly aiBillingService: AiBillingService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly redisClientService: RedisClientService,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadEntity>,
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
    return this.sharingService.getReadableThread({
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

  @Query(() => ChatStreamCatchupChunksDTO)
  async chatStreamCatchupChunks(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    const thread = await this.sharingService.getReadableThread({
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

  @Query(() => [AgentChatThreadDTO])
  async chatThreadsForRecord(
    @Args('objectNameSingular', { type: () => String })
    objectNameSingular: string,
    @Args('recordId', { type: () => UUIDScalarType }) recordId: string,
    @Args('limit', {
      type: () => Int,
      defaultValue: DEFAULT_CHAT_THREADS_FOR_RECORD_LIMIT,
    })
    limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    assertValidChatThreadsForRecordPagination({ limit, offset });

    const joinColumnName =
      await this.agentChatThreadTargetService.resolveAuthorizedRecordOrThrow({
        objectNameSingular,
        recordId,
        workspaceId,
      });

    return this.agentChatService.getThreadsAttachedToRecord({
      joinColumnName,
      recordId,
      userWorkspaceId,
      workspaceId,
      limit,
      offset,
    });
  }

  @Mutation(() => Boolean)
  async attachChatThreadToRecord(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('objectNameSingular', { type: () => String })
    objectNameSingular: string,
    @Args('recordId', { type: () => UUIDScalarType }) recordId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.agentChatThreadTargetService.attachThreadToRecord({
      threadId,
      objectNameSingular,
      recordId,
      userWorkspaceId,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async detachChatThreadFromRecord(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('objectNameSingular', { type: () => String })
    objectNameSingular: string,
    @Args('recordId', { type: () => UUIDScalarType }) recordId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.agentChatThreadTargetService.detachThreadFromRecord({
      threadId,
      objectNameSingular,
      recordId,
      userWorkspaceId,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => AgentChatThreadDTO)
  async createChatThread(
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.agentChatService.createThread({
      userWorkspaceId,
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

    const thread = await this.agentChatService.getWritableThread({
      threadId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId: workspace.id,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId },
    });

    if (isDefined(thread.deletedAt)) {
      await this.agentChatService.unarchiveThread({
        threadId,
        userWorkspaceId,
        workspaceId: workspace.id,
      });
    }

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

    await this.agentChatService.getWritableThread({
      threadId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

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

    await this.agentChatService.getWritableThread({
      threadId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

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
    const thread = await this.agentChatService.getWritableThread({
      threadId,
      userWorkspaceId,
      workspaceId,
    });
    if (!isDefined(thread.activeStreamId)) {
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
  async archiveChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadEntity> {
    await this.sharingService.getThreadWithAccess({
      threadId: id,
      userWorkspaceId,
      workspaceId,
      operationType: 'soft-delete',
    });
    await this.cancelActiveStreamIfAny(id, workspaceId);

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
    await this.sharingService.getThreadWithAccess({
      threadId: id,
      userWorkspaceId,
      workspaceId,
      operationType: 'delete',
    });
    await this.cancelActiveStreamIfAny(id, workspaceId);

    await this.agentChatService.hardDeleteThread({
      threadId: id,
      userWorkspaceId,
      workspaceId,
    });

    return true;
  }

  private async cancelActiveStreamIfAny(
    threadId: string,
    workspaceId: string,
  ): Promise<void> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
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

    await this.agentChatService.getWritableThread({
      threadId: message.threadId,
      userWorkspaceId,
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
    @Parent()
    thread: AgentChatThreadEntity & { lastMessageAt?: Date | null },
  ): Promise<Date | null> {
    if (thread.lastMessageAt !== undefined) {
      return thread.lastMessageAt;
    }

    return this.agentChatService.getLastMessageAtForThread({
      threadId: thread.id,
      workspaceId: thread.workspaceId,
    });
  }
}
