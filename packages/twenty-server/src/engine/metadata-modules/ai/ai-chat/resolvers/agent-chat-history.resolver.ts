import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AgentMessageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message.dto';
import { AgentChatConversationInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-conversation.input';
import { ChatStreamCatchupChunksDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-stream-catchup-chunks.dto';
import { AgentChatConversationAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-conversation-access.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatMessageReactionService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-message-reaction.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(AuthGraphqlApiExceptionFilter)
@MetadataResolver()
export class AgentChatHistoryResolver {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly conversationAccessService: AgentChatConversationAccessService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly messageReactionService: AgentChatMessageReactionService,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
  ) {}

  @Query(() => [AgentMessageDTO])
  async chatMessages(
    @Args() conversation: AgentChatConversationInput,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ) {
    const workspaceId = workspace.id;
    const threadId =
      await this.conversationAccessService.resolveReadableThreadIdOrThrow({
        workspace,
        callerApplication,
        workspaceMemberId,
        conversation,
      });
    const messages = await this.agentChatService.getMessagesVisibleTo({
      threadId,
      workspaceMemberId,
      workspaceId,
    });
    const [{ flatWorkspaceMemberMaps }, reactionsByMessageId] =
      await Promise.all([
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatWorkspaceMemberMaps',
        ]),
        this.messageReactionService.findReactionsByMessageId({
          workspaceId,
          messageIds: messages.map(({ id }) => id),
        }),
      ]);

    // fronts cached from the release before still name senders by their membership
    return messages.map((message) => {
      const senderUserId = isDefined(message.senderWorkspaceMemberId)
        ? flatWorkspaceMemberMaps.byId[message.senderWorkspaceMemberId]?.userId
        : undefined;

      return {
        ...message,
        reactions: reactionsByMessageId.get(message.id) ?? [],
        senderUserWorkspaceId: isDefined(senderUserId)
          ? (flatWorkspaceMemberMaps.userWorkspaceIdByUserId[senderUserId] ??
            null)
          : null,
      };
    });
  }

  @Query(() => ChatStreamCatchupChunksDTO)
  async chatStreamCatchupChunks(
    @Args() conversation: AgentChatConversationInput,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ) {
    const workspaceId = workspace.id;
    const threadId =
      await this.conversationAccessService.resolveReadableThreadIdOrThrow({
        workspace,
        callerApplication,
        workspaceMemberId,
        conversation,
      });
    // an application's conversation has no thread until its first run starts
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'activeStreamId'],
    });

    if (isDefined(thread)) {
      await this.streamRecoveryService.reapDeadStream({ thread, workspaceId });
    }

    const { chunks, maxSeq } =
      await this.eventPublisherService.getAccumulatedChunks(threadId);

    const turnError = await this.turnRecorderService.findLatestTurnError({
      workspaceId,
      threadId,
    });

    return {
      chunks: await this.conversationAccessService.getVisibleCatchupChunks({
        workspaceId,
        threadId,
        workspaceMemberId,
        chunks,
      }),
      maxSeq,
      error: turnError
        ? { code: turnError.code, message: turnError.message }
        : null,
    };
  }
}
