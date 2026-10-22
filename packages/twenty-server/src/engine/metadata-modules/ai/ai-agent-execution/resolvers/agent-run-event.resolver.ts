import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Query, Subscription } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AgentRunEventPayloadDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-run-event-payload.dto';
import { AgentRunEventsDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-run-events.dto';
import {
  AgentRunEventService,
  type AgentRunEventSubscriptionPayload,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-event.service';
import { AGENT_CHAT_KEEPALIVE_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-keepalive-interval-ms.constant';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { buildAgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/utils/build-agent-conversation-actor.util';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { aiGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/utils/ai-graphql-api-exception-handler.util';
import { createSubscriptionAuthorization } from 'src/engine/subscriptions/utils/create-subscription-authorization';
import { withAsyncIteratorAuthorization } from 'src/engine/subscriptions/utils/with-async-iterator-authorization';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';

@UseGuards(
  AuthPrincipalGuard({
    userSession: false,
    apiKey: false,
    oauthClient: false,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(AuthGraphqlApiExceptionFilter)
@MetadataResolver()
export class AgentRunEventResolver {
  constructor(
    private readonly agentRunEventService: AgentRunEventService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
  ) {}

  @Query(() => AgentRunEventsDTO)
  async agentRunEvents(
    @Args('agentUniversalIdentifier', { type: () => UUIDScalarType })
    agentUniversalIdentifier: string,
    @Args('threadKey') threadKey: string,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplication() callerApplication: FlatApplication,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<AgentRunEventsDTO> {
    const threadId = await this.agentRunEventService.findThreadIdOrThrow({
      workspaceId: workspace.id,
      callerApplication,
      agentUniversalIdentifier,
      threadKey,
    });

    return {
      threadId,
      events: await this.agentRunEventService.listEvents({
        workspaceId: workspace.id,
        threadId,
        actor: buildAgentConversationActor({
          workspaceMemberId,
          applicationId: callerApplication.id,
        }),
      }),
    };
  }

  @Subscription(() => AgentRunEventPayloadDTO)
  async onAgentRunEvent(
    @Args('agentUniversalIdentifier', { type: () => UUIDScalarType })
    agentUniversalIdentifier: string,
    @Args('threadKey') threadKey: string,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplication() callerApplication: FlatApplication,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<AsyncIterableIterator<AgentRunEventSubscriptionPayload>> {
    const findThreadId = () =>
      this.agentRunEventService
        .findThreadIdOrThrow({
          workspaceId: workspace.id,
          callerApplication,
          agentUniversalIdentifier,
          threadKey,
        })
        .catch(aiGraphqlApiExceptionHandler);

    const threadId = await findThreadId();
    const authorize = createSubscriptionAuthorization({
      check: findThreadId,
      maxAgeMs: AGENT_CHAT_KEEPALIVE_INTERVAL_MS,
    });

    const iterator = await this.agentRunEventService.subscribeToEvents({
      workspaceId: workspace.id,
      threadId,
      actor: buildAgentConversationActor({
        workspaceMemberId,
        applicationId: callerApplication.id,
      }),
    });

    const heartbeat = this.streamRecoveryService.createSubscriberHeartbeat({
      workspaceId: workspace.id,
      threadId,
    });

    return withAsyncIteratorAuthorization({
      iterator: wrapAsyncIteratorWithLifecycle(() => iterator, {
        initialValue: { onAgentRunEvent: { threadId, event: null } },
        heartbeatErrorBehavior: 'close',
        onHeartbeat: async () => {
          await authorize(true);
          await heartbeat();

          return true;
        },
        heartbeatIntervalMs: AGENT_CHAT_KEEPALIVE_INTERVAL_MS,
      }),
      authorize,
    });
  }
}
