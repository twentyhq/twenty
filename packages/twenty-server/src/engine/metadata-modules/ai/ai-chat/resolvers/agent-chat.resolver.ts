import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Args,
  Float,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { InjectRepository } from '@nestjs/typeorm';
import GraphQLJSON from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentMessageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message.dto';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import { AiSystemPromptPreviewDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-system-prompt-preview.dto';
import { ChatStreamCatchupChunksDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-stream-catchup-chunks.dto';
import { SendChatMessageResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-chat-message-result.dto';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@MetadataResolver(() => AgentChatThreadDTO)
export class AgentChatResolver {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly systemPromptBuilderService: SystemPromptBuilderService,
    private readonly billingUsageService: BillingUsageService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly redisClientService: RedisClientService,
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
  ) {}

  @Query(() => [AgentChatThreadDTO])
  async chatThreads(@AuthUserWorkspaceId() userWorkspaceId: string) {
    return this.agentChatService.getThreadsForUser(userWorkspaceId);
  }

  @Query(() => AgentChatThreadDTO)
  async chatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.agentChatService.getThreadById(id, userWorkspaceId);
  }

  @Query(() => [AgentMessageDTO])
  async chatMessages(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.agentChatService.getMessagesForThread(
      threadId,
      userWorkspaceId,
    );
  }

  @Query(() => ChatStreamCatchupChunksDTO)
  async chatStreamCatchupChunks(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    await this.agentChatService.getThreadById(threadId, userWorkspaceId);

    return this.eventPublisherService.getAccumulatedChunks(threadId);
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
    @Args('fileIds', { type: () => [UUIDScalarType], nullable: true })
    fileIds: string[] | null,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SendChatMessageResultDTO> {
    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AiException(
        'No AI models are available. Configure at least one AI provider.',
        AiExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    const resolvedModelId = modelId ?? workspace.smartModel;

    this.aiModelRegistryService.validateModelAvailability(
      resolvedModelId,
      workspace,
    );

    await this.billingUsageService.hasAvailableCreditsOrThrow(workspace.id);

    const thread = await this.threadRepository.findOne({
      where: { id: threadId, userWorkspaceId },
    });

    if (!isDefined(thread)) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    if (isDefined(thread.deletedAt)) {
      await this.agentChatService.unarchiveThread({
        threadId,
        userWorkspaceId,
      });
    }

    if (isDefined(thread.activeStreamId)) {
      const queuedMessage = await this.agentChatService.queueMessage({
        threadId,
        text,
        id: messageId,
        fileIds: fileIds ?? undefined,
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
      fileIds: fileIds ?? undefined,
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
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<boolean> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId, userWorkspaceId },
    });

    if (!isDefined(thread) || !isDefined(thread.activeStreamId)) {
      return true;
    }

    const redis = this.redisClientService.getClient();

    await redis.publish(getCancelChannel(threadId), 'cancel');

    await this.threadRepository.update(
      { id: threadId, userWorkspaceId },
      { activeStreamId: null },
    );

    return true;
  }

  @Mutation(() => AgentChatThreadDTO)
  async renameChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @Args('title') title: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<AgentChatThreadEntity> {
    return this.agentChatService.updateThreadTitle({
      threadId: id,
      userWorkspaceId,
      title,
    });
  }

  @Mutation(() => AgentChatThreadDTO)
  async archiveChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<AgentChatThreadEntity> {
    await this.cancelActiveStreamIfAny(id, userWorkspaceId);

    return this.agentChatService.archiveThread({
      threadId: id,
      userWorkspaceId,
    });
  }

  @Mutation(() => AgentChatThreadDTO)
  async unarchiveChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<AgentChatThreadEntity> {
    return this.agentChatService.unarchiveThread({
      threadId: id,
      userWorkspaceId,
    });
  }

  @Mutation(() => Boolean)
  async deleteChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<boolean> {
    await this.cancelActiveStreamIfAny(id, userWorkspaceId);

    await this.agentChatService.hardDeleteThread({
      threadId: id,
      userWorkspaceId,
    });

    return true;
  }

  private async cancelActiveStreamIfAny(
    threadId: string,
    userWorkspaceId: string,
  ): Promise<void> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId, userWorkspaceId },
    });

    if (!isDefined(thread) || !isDefined(thread.activeStreamId)) {
      return;
    }

    const redis = this.redisClientService.getClient();

    await redis.publish(getCancelChannel(threadId), 'cancel');
  }

  @Mutation(() => Boolean)
  async deleteQueuedChatMessage(
    @Args('messageId', { type: () => UUIDScalarType }) messageId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const message = await this.agentChatService.findQueuedMessage(messageId);

    if (!isDefined(message)) {
      throw new AiException(
        'Queued message not found',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }

    const thread = await this.threadRepository.findOne({
      where: { id: message.threadId, userWorkspaceId },
    });

    if (!isDefined(thread)) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    const deleted = await this.agentChatService.deleteQueuedMessage(messageId);

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

    return this.agentChatService.getLastMessageAtForThread(thread.id);
  }
}
