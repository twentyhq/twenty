import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { SetuAiActionDispatcherCronCommand } from 'src/engine/metadata-modules/ai/ai-actions/crons/commands/setu-ai-action-dispatcher.cron.command';
import { SetuAiActionDispatcherCronJob } from 'src/engine/metadata-modules/ai/ai-actions/crons/jobs/setu-ai-action-dispatcher.cron.job';
import { SetuAiActionAttemptEntity } from 'src/engine/metadata-modules/ai/ai-actions/entities/setu-ai-action-attempt.entity';
import { SetuAiActionRequestEntity } from 'src/engine/metadata-modules/ai/ai-actions/entities/setu-ai-action-request.entity';
import { ExecuteSetuAiActionJob } from 'src/engine/metadata-modules/ai/ai-actions/jobs/execute-setu-ai-action.job';
import { SetuAiActionResolver } from 'src/engine/metadata-modules/ai/ai-actions/resolvers/setu-ai-action.resolver';
import { SetuAiActionGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/ai-actions/setu-ai-action-graphql-api-exception.interceptor';
import { SetuAiActionActorService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-actor.service';
import { SetuAiActionChatPolicyService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-chat-policy.service';
import { SetuAiActionDispatcherService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-dispatcher.service';
import { SetuAiActionExecutionService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-execution.service';
import { SetuAiActionLedgerService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-ledger.service';
import { SetuAiActionPreparationService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-preparation.service';
import { SetuAiActionService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { MessagingSendManagerModule } from 'src/modules/messaging/message-outbound-manager/messaging-send-manager.module';

// Durable review and execution of AI-proposed CRM actions. Kept apart from
// the chat runtime: chat only receives the policy and the proposal tool.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SetuAiActionRequestEntity,
      SetuAiActionAttemptEntity,
      ConnectedAccountEntity,
    ]),
    FeatureFlagModule,
    MessagingSendManagerModule,
    PermissionsModule,
    ToolModule,
    UserWorkspaceModule,
    WorkspaceCacheModule,
  ],
  providers: [
    SetuAiActionActorService,
    SetuAiActionChatPolicyService,
    SetuAiActionDispatcherService,
    SetuAiActionExecutionService,
    SetuAiActionLedgerService,
    SetuAiActionPreparationService,
    SetuAiActionService,
    ExecuteSetuAiActionJob,
    SetuAiActionDispatcherCronJob,
    SetuAiActionDispatcherCronCommand,
    SetuAiActionResolver,
    SetuAiActionGraphqlApiExceptionInterceptor,
  ],
  exports: [
    SetuAiActionActorService,
    SetuAiActionChatPolicyService,
    SetuAiActionDispatcherCronCommand,
  ],
})
export class AiActionsModule {}
