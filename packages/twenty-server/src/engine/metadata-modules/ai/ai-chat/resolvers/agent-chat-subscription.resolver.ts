import { createSubscriptionAuthorization } from 'src/engine/subscriptions/utils/create-subscription-authorization';
import { aiGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/utils/ai-graphql-api-exception-handler.util';
import { AgentChatConversationAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-conversation-access.service';
import { maskStreamChunkOfTurnActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/mask-stream-chunk-of-turn-acted-by-others.util';
import { filterMapAsyncIterator } from 'src/engine/subscriptions/utils/filter-map-async-iterator';
import { withAsyncIteratorAuthorization } from 'src/engine/subscriptions/utils/with-async-iterator-authorization';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Subscription } from '@nestjs/graphql';

import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { AGENT_CHAT_KEEPALIVE_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-keepalive-interval-ms.constant';
import { AGENT_CHAT_STREAM_REAP_CHECK_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-stream-reap-check-interval-ms.constant';
import { AgentChatConversationInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-conversation.input';
import { AgentChatEventDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-event.dto';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';
type AgentChatEventPayload = {
  onAgentChatEvent: { threadId: string; event: AgentChatSubscriptionEvent };
};

@MetadataResolver()
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
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
export class AgentChatSubscriptionResolver {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly conversationAccessService: AgentChatConversationAccessService,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
  ) {}

  // the channel is the thread's own, so its events need no filter
  @Subscription(() => AgentChatEventDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  async onAgentChatEvent(
    @Args() conversation: AgentChatConversationInput,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplication({ allowUndefined: true })
    callerApplication: FlatApplication | undefined,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ) {
    // resolving the conversation is its access check, and names the same thread each time
    let threadId = '';
    const authorize = createSubscriptionAuthorization({
      check: async () => {
        threadId = await this.conversationAccessService
          .resolveReadableThreadIdOrThrow({
            workspace,
            callerApplication,
            workspaceMemberId,
            conversation,
          })
          .catch(aiGraphqlApiExceptionHandler);
      },
      maxAgeMs: AGENT_CHAT_KEEPALIVE_INTERVAL_MS,
    });

    await authorize();

    const isLatestTurnOpenedByOtherMember = () =>
      this.conversationAccessService.isLatestTurnOpenedByOtherMember({
        workspaceId: workspace.id,
        threadId,
        workspaceMemberId,
      });
    let isStreamingTurnHidden = await isLatestTurnOpenedByOtherMember();

    const iterator = filterMapAsyncIterator(
      await this.subscriptionService.subscribeToAgentChat<AgentChatEventPayload>(
        { workspaceId: workspace.id, threadId },
      ),
      async (payload) => {
        const { event } = payload.onAgentChatEvent;

        if (event.type !== 'stream-chunk') {
          return payload;
        }

        // every reply opens with a start chunk, so the turn it streams is known by then
        if (event.chunk.type === 'start') {
          isStreamingTurnHidden = await isLatestTurnOpenedByOtherMember();
        }

        return isStreamingTurnHidden
          ? {
              onAgentChatEvent: {
                threadId,
                event: {
                  ...event,
                  chunk: maskStreamChunkOfTurnActedByOthers(event.chunk),
                },
              },
            }
          : payload;
      },
    );

    const keepalivePayload: AgentChatEventPayload = {
      onAgentChatEvent: { threadId, event: { type: 'keepalive' } },
    };

    let lastReapCheckAt = 0;

    return withAsyncIteratorAuthorization({
      iterator: wrapAsyncIteratorWithLifecycle(() => iterator, {
        initialValue: keepalivePayload,
        heartbeatErrorBehavior: 'close',
        onHeartbeat: async () => {
          await authorize(true);
          if (
            Date.now() - lastReapCheckAt >=
            AGENT_CHAT_STREAM_REAP_CHECK_INTERVAL_MS
          ) {
            lastReapCheckAt = Date.now();
            await this.reapWatchedStreamIfDead(workspace.id, threadId);
          }

          await this.subscriptionService.publishToAgentChat({
            workspaceId: workspace.id,
            threadId,
            payload: keepalivePayload,
          });

          return true;
        },
        heartbeatIntervalMs: AGENT_CHAT_KEEPALIVE_INTERVAL_MS,
      }),
      authorize,
    });
  }

  private async reapWatchedStreamIfDead(
    workspaceId: string,
    threadId: string,
  ): Promise<void> {
    const thread = await this.threadRepository
      .findOne(workspaceId, {
        where: { id: threadId },
        select: ['id', 'activeStreamId'],
      })
      .catch(() => null);

    if (!isDefined(thread)) {
      return;
    }

    await this.streamRecoveryService
      .reapDeadStream({ thread, workspaceId })
      .catch(() => {});
  }
}
