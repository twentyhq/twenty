import { createSubscriptionAuthorization } from 'src/engine/subscriptions/utils/create-subscription-authorization';
import { aiGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/utils/ai-graphql-api-exception-handler.util';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { withAsyncIteratorAuthorization } from 'src/engine/subscriptions/utils/with-async-iterator-authorization';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Subscription } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { AGENT_CHAT_KEEPALIVE_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-keepalive-interval-ms.constant';
import { AGENT_CHAT_STREAM_REAP_CHECK_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-stream-reap-check-interval-ms.constant';
import { AgentChatEventDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-event.dto';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';
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
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
export class AgentChatSubscriptionResolver {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly sharingService: AgentChatSharingService,
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
          .catch(aiGraphqlApiExceptionHandler),
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
            await this.streamRecoveryService.reapDeadStreamOfThread({
              workspaceId: workspace.id,
              threadId,
            });
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
}
