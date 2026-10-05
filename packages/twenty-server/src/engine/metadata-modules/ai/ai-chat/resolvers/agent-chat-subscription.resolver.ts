import { createSubscriptionAuthorization } from 'src/engine/subscriptions/utils/create-subscription-authorization';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { withAsyncIteratorAuthorization } from 'src/engine/subscriptions/utils/with-async-iterator-authorization';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { UseGuards } from '@nestjs/common';
import { Args, Subscription } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { convertCustomExceptionToGraphQLError } from 'src/engine/core-modules/graphql/utils/convert-custom-exception-to-graphql-error.util';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AGENT_CHAT_KEEPALIVE_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-keepalive-interval-ms.constant';
import { AGENT_CHAT_STREAM_REAP_CHECK_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-stream-reap-check-interval-ms.constant';
import { AgentChatEventDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-event.dto';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';
import { CustomException } from 'src/utils/custom-exception';
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
    application: { withUser: true, withoutUser: false },
  }),
)
export class AgentChatSubscriptionResolver {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly sharingService: AgentChatSharingService,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
  ) {}

  @Subscription(() => AgentChatEventDTO, {
    filter: (
      payload: { onAgentChatEvent: AgentChatEventDTO },
      variables: { threadId: string },
    ) => {
      return payload.onAgentChatEvent.threadId === variables.threadId;
    },
  })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  async onAgentChatEvent(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ) {
    const authorize = createSubscriptionAuthorization({
      check: () =>
        this.sharingService
          .getReadableThread({
            workspaceId: workspace.id,
            threadId,
            workspaceMemberId,
          })
          .catch((error) => {
            // Subscriptions bypass the GraphQL error hook, so convert here
            throw error instanceof CustomException
              ? convertCustomExceptionToGraphQLError(error)
              : error;
          }),
      maxAgeMs: AGENT_CHAT_KEEPALIVE_INTERVAL_MS,
    });
    await authorize();

    const iterator = await this.subscriptionService.subscribeToAgentChat({
      workspaceId: workspace.id,
      threadId,
    });

    const keepalivePayload = {
      onAgentChatEvent: {
        threadId,
        event: { type: 'keepalive' as const },
      },
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
