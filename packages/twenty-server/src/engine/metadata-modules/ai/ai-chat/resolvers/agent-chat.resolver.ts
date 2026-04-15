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
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AgentGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/ai-agent/interceptors/agent-graphql-api-exception.interceptor';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';
import { AgentMessageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message.dto';
import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import { AISystemPromptPreviewDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-system-prompt-preview.dto';
import { ChatStreamCatchupChunksDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-stream-catchup-chunks.dto';
import { SendChatMessageResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-chat-message-result.dto';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(AgentGraphqlApiExceptionInterceptor)
@MetadataResolver(() => AgentChatThreadDTO)
export class AgentChatResolver {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly systemPromptBuilderService: SystemPromptBuilderService,
    private readonly billingService: BillingService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly redisClientService: RedisClientService,
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
  ) {}

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

  @Query(() => ChatStreamCatchupChunksDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async chatStreamCatchupChunks(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    await this.agentChatService.getThreadById(threadId, userWorkspaceId);

    return this.eventPublisherService.getAccumulatedChunks(threadId);
  }

  @Mutation(() => AgentChatThreadDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
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
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
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
      throw new AgentException(
        'No AI models are available. Configure at least one AI provider.',
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    const resolvedModelId = modelId ?? workspace.smartModel;

    this.aiModelRegistryService.validateModelAvailability(
      resolvedModelId,
      workspace,
    );

    if (this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      const canBill = await this.billingService.canBillMeteredProduct(
        workspace.id,
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
      );

      if (!canBill) {
        throw new BillingException(
          'Credits exhausted',
          BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
        );
      }
    }

    const thread = await this.threadRepository.findOne({
      where: { id: threadId, userWorkspaceId },
    });

    if (!isDefined(thread)) {
      throw new AgentException(
        'Thread not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    if (isDefined(thread.activeStreamId)) {
      const queuedMessage = await this.agentChatService.queueMessage({
        threadId,
        text,
        id: messageId,
        fileIds: fileIds ?? undefined,
        workspaceId: workspace.id,
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
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
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

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async deleteQueuedChatMessage(
    @Args('messageId', { type: () => UUIDScalarType }) messageId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const message = await this.agentChatService.findQueuedMessage(messageId);

    if (!isDefined(message)) {
      throw new AgentException(
        'Queued message not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const thread = await this.threadRepository.findOne({
      where: { id: message.threadId, userWorkspaceId },
    });

    if (!isDefined(thread)) {
      throw new AgentException(
        'Thread not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
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
