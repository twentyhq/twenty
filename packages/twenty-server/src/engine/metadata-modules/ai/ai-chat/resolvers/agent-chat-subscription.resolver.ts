import { createSubscriptionAuthorization } from 'src/engine/subscriptions/utils/create-subscription-authorization';
import { aiGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/utils/ai-graphql-api-exception-handler.util';
import { AgentChatConversationAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-conversation-access.service';
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
import { type ApplicationCallerOperation } from 'src/engine/core-modules/application/types/application-caller-operation.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { AGENT_CHAT_KEEPALIVE_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-keepalive-interval-ms.constant';
import { AGENT_CHAT_STREAM_REAP_CHECK_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-stream-reap-check-interval-ms.constant';
import { AgentChatEventInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-event.input';
import { type AgentChatChannel } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel.type';
import { AgentChatEventDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-event.dto';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';
type AgentChatEventPayload = {
  onAgentChatEvent: {
    threadId: string | null;
    event: AgentChatSubscriptionEvent;
  };
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

  @Subscription(() => AgentChatEventDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  async onAgentChatEvent(
    @Args() source: AgentChatEventInput,
    @AuthWorkspace()
    workspace: Pick<FlatWorkspace, 'id' | 'workspaceCustomApplicationId'>,
    @AuthApplication({ allowUndefined: true })
    callerApplication: ApplicationCallerOperation['callingApplication'],
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ) {
    let channel: AgentChatChannel = { kind: 'thread', channelId: '' };
    const authorize = createSubscriptionAuthorization({
      check: async () => {
        channel = await this.conversationAccessService
          .resolveReadableChannelOrThrow({
            workspace,
            callerApplication,
            workspaceMemberId,
            source,
          })
          .catch(aiGraphqlApiExceptionHandler);
      },
      maxAgeMs: AGENT_CHAT_KEEPALIVE_INTERVAL_MS,
    });

    await authorize();

    const { kind, channelId } = channel;
    const threadId = kind === 'thread' ? channelId : null;
    const filterVisibleEvent = isDefined(threadId)
      ? await this.conversationAccessService.createLiveEventFilter({
          workspaceId: workspace.id,
          threadId,
          workspaceMemberId,
        })
      : null;

    const iterator = filterMapAsyncIterator(
      await this.subscriptionService.subscribeToAgentChat<AgentChatEventPayload>(
        { workspaceId: workspace.id, threadId: channelId },
      ),
      async ({ onAgentChatEvent: { event } }) => ({
        onAgentChatEvent: {
          threadId,
          event: isDefined(filterVisibleEvent)
            ? await filterVisibleEvent(event)
            : event,
        },
      }),
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
            isDefined(threadId) &&
            Date.now() - lastReapCheckAt >=
              AGENT_CHAT_STREAM_REAP_CHECK_INTERVAL_MS
          ) {
            lastReapCheckAt = Date.now();
            await this.reapWatchedStreamIfDead(workspace.id, threadId);
          }

          await this.subscriptionService.publishToAgentChat({
            workspaceId: workspace.id,
            threadId: channelId,
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
