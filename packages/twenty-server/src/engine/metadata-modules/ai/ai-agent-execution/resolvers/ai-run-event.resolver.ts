import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Query, Subscription } from '@nestjs/graphql';

import { type AiRunEvent } from 'twenty-shared/application';
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
import { AiRunEventDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/ai-run-event.dto';
import { AiRunEventsInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/ai-run-events.input';
import { AiRunEventService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/ai-run-event.service';
import { AGENT_CHAT_KEEPALIVE_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-keepalive-interval-ms.constant';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { aiGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/utils/ai-graphql-api-exception-handler.util';
import { createSubscriptionAuthorization } from 'src/engine/subscriptions/utils/create-subscription-authorization';
import { withAsyncIteratorAuthorization } from 'src/engine/subscriptions/utils/with-async-iterator-authorization';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';

const buildActor = ({
  workspaceMemberId,
  callerApplication,
}: {
  workspaceMemberId: string | undefined;
  callerApplication: FlatApplication;
}): AgentConversationActor =>
  isDefined(workspaceMemberId)
    ? { type: 'user', workspaceMemberId }
    : { type: 'application', applicationId: callerApplication.id };

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
export class AiRunEventResolver {
  constructor(
    private readonly aiRunEventService: AiRunEventService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
  ) {}

  @Query(() => [AiRunEventDTO])
  async aiRunEvents(
    @Args() { after, ...target }: AiRunEventsInputDTO,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplication() callerApplication: FlatApplication,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<AiRunEvent[]> {
    return this.aiRunEventService.listEvents({
      workspaceId: workspace.id,
      scope: await this.aiRunEventService.resolveScopeOrThrow({
        workspace,
        callerApplication,
        target,
      }),
      actor: buildActor({ workspaceMemberId, callerApplication }),
      after,
    });
  }

  @Subscription(() => AiRunEventDTO, {
    resolve: (event: AiRunEvent) => event,
  })
  async onAiRunEvent(
    @Args() { after, ...target }: AiRunEventsInputDTO,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplication() callerApplication: FlatApplication,
    @AuthWorkspaceMemberId() workspaceMemberId: string | undefined,
  ): Promise<AsyncIterableIterator<AiRunEvent>> {
    const resolveScope = () =>
      this.aiRunEventService
        .resolveScopeOrThrow({ workspace, callerApplication, target })
        .catch(aiGraphqlApiExceptionHandler);

    const scope = await resolveScope();
    const authorize = createSubscriptionAuthorization({
      check: resolveScope,
      maxAgeMs: AGENT_CHAT_KEEPALIVE_INTERVAL_MS,
    });
    const iterator = await this.aiRunEventService
      .streamEvents({
        workspaceId: workspace.id,
        scope,
        actor: buildActor({ workspaceMemberId, callerApplication }),
        after,
      })
      .catch(aiGraphqlApiExceptionHandler);
    const heartbeat = isDefined(scope.threadId)
      ? this.streamRecoveryService.createSubscriberHeartbeat({
          workspaceId: workspace.id,
          threadId: scope.threadId,
        })
      : null;

    return withAsyncIteratorAuthorization({
      iterator: wrapAsyncIteratorWithLifecycle(() => iterator, {
        heartbeatErrorBehavior: 'close',
        onHeartbeat: async () => {
          await authorize(true);
          await heartbeat?.();

          return true;
        },
        heartbeatIntervalMs: AGENT_CHAT_KEEPALIVE_INTERVAL_MS,
      }),
      authorize,
    });
  }
}
