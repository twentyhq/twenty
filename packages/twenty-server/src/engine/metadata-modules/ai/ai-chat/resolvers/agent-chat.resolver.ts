import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
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
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentMessageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message.dto';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import { FileAttachmentInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/file-attachment.input';
import { AiSystemPromptPreviewDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-system-prompt-preview.dto';
import { ChatStreamCatchupChunksDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-stream-catchup-chunks.dto';
import { SendChatMessageResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-chat-message-result.dto';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';
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
    private readonly sharingService: AgentChatSharingService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly systemPromptBuilderService: SystemPromptBuilderService,
    private readonly aiBillingService: AiBillingService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
  ) {}

  @Query(() => [AgentChatThreadDTO])
  @AllowSuspendedWorkspace()
  async chatThreads(
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.agentChatService.getThreadsForMember({
      workspaceMemberId,
      workspaceId,
    });
  }

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
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.agentChatService.createThread({
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
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
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
      workspaceMemberId,
      workspaceId: workspace.id,
    });

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId: workspace.id,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId },
    });

    if (isDefined(thread.archivedAt)) {
      await this.agentChatService.unarchiveThread({
        threadId,
        workspaceMemberId,
        workspaceId: workspace.id,
      });
    }

    if (isNonEmptyString(thread.activeStreamId)) {
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
      threadId,
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
      workspaceMemberId,
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
    const thread = await this.agentChatService.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    await this.threadLifecycleService.stopStreamIfAny({ workspaceId, thread });

    return true;
  }

  @Mutation(() => AgentChatThreadDTO)
  async renameChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @Args('title') title: string,

    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadWorkspaceEntity> {
    return this.agentChatService.updateThreadTitle({
      threadId: id,
      workspaceMemberId,
      workspaceId,
      title,
    });
  }

  @Mutation(() => AgentChatThreadDTO)
  async archiveChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,

    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadWorkspaceEntity> {
    const thread = await this.agentChatService.archiveThread({
      threadId: id,
      workspaceMemberId,
      workspaceId,
    });

    await this.threadLifecycleService.stopArchivedThreads({
      workspaceId,
      threadIds: [id],
    });

    return thread;
  }

  @Mutation(() => AgentChatThreadDTO)
  async unarchiveChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,

    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<AgentChatThreadWorkspaceEntity> {
    return this.agentChatService.unarchiveThread({
      threadId: id,
      workspaceMemberId,
      workspaceId,
    });
  }

  @Mutation(() => Boolean)
  async deleteChatThread(
    @Args('id', { type: () => UUIDScalarType }) id: string,

    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<boolean> {
    await this.agentChatService.hardDeleteThread({
      threadId: id,
      workspaceMemberId,
      workspaceId,
    });

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

    await this.agentChatService.getWritableThread({
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
    return isDefined(thread.archivedAt) ? new Date(thread.archivedAt) : null;
  }

  @ResolveField(() => Float)
  totalInputCredits(@Parent() thread: AgentChatThreadWorkspaceEntity): number {
    return toDisplayCredits(Number(thread.totalInputCredits));
  }

  @ResolveField(() => Float)
  totalOutputCredits(@Parent() thread: AgentChatThreadWorkspaceEntity): number {
    return toDisplayCredits(Number(thread.totalOutputCredits));
  }

  @ResolveField('lastMessageAt', () => Date, { nullable: true })
  async lastMessageAt(
    @Parent()
    thread: AgentChatThreadWorkspaceEntity & { lastMessageAt?: Date | null },
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<Date | null> {
    if (thread.lastMessageAt !== undefined) {
      return thread.lastMessageAt;
    }

    return this.agentChatService.getLastMessageAtForThread({
      threadId: thread.id,
      workspaceId,
    });
  }
}
