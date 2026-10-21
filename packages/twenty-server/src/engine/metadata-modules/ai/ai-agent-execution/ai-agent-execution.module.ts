import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpModule } from 'src/engine/core-modules/pending-wake-up/pending-wake-up.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ContinueAgentRunJob } from 'src/engine/metadata-modules/ai/ai-agent-execution/jobs/continue-agent-run.job';
import { DeliverAgentRunOutcomeJob } from 'src/engine/metadata-modules/ai/ai-agent-execution/jobs/deliver-agent-run-outcome.job';
import { RunAgentJob } from 'src/engine/metadata-modules/ai/ai-agent-execution/jobs/run-agent.job';
import { AgentMessagePartResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-message-part.resolver';
import { AgentMessageResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-message.resolver';
import { AgentRunResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-run.resolver';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentCallerConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-conversation.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentRunPendingWakeUpHandlerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-pending-wake-up-handler.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AgentRunSettlementService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-settlement.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { AgentStepLoopService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-step-loop.service';
import { AgentToolsetService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-toolset.service';
import { AgentRunTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { AgentTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-turn.service';
import { RunAgentAttachmentService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-attachment.service';
import { AgentChatStreamStateModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-stream-state.module';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AiAgentRoleModule } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SkillModule } from 'src/engine/metadata-modules/skill/skill.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    AgentChatThreadLifecycleModule,
    AgentChatStreamStateModule,
    AgentChatThreadModule,
    AgentHistoryModule,
    AiBillingModule,
    AiAgentModule,
    AiAgentRoleModule,
    ApiKeyModule,
    ApplicationLookupModule,
    FileUrlModule,
    MetricsModule,
    PendingWakeUpModule,
    UserWorkspaceModule,
    UserRoleModule,
    PermissionsModule,
    SkillModule,
    ToolProviderModule,
    TypeOrmModule.forFeature([
      AgentEntity,
      FileEntity,
      PendingWakeUpEntity,
      WorkspaceEntity,
    ]),
  ],
  providers: [
    AgentActorContextService,
    AgentCallerConversationService,
    AgentRunCallerHandlerRegistryService,
    AgentRunConversationService,
    AgentRunSuspensionService,
    AgentMessagePartResolver,
    AgentMessageResolver,
    AgentRunResolver,
    AgentRunService,
    AgentRunSettlementService,
    AgentRunnerService,
    AgentStepLoopService,
    AgentToolsetService,
    AgentRunTurnService,
    AgentTurnService,
    // continues suspended runs once answered or woken up, on the server and the worker alike
    AgentRunPendingWakeUpHandlerService,
    ContinueAgentRunJob,
    DeliverAgentRunOutcomeJob,
    RunAgentAttachmentService,
    RunAgentJob,
    provideWorkspaceScopedRepository(AgentEntity),
    provideWorkspaceScopedRepository(FileEntity),
    provideWorkspaceScopedRepository(PendingWakeUpEntity),
  ],
  exports: [
    AgentActorContextService,
    AgentCallerConversationService,
    AgentRunCallerHandlerRegistryService,
    AgentRunConversationService,
    AgentRunSuspensionService,
    AgentRunnerService,
    AgentTurnService,
  ],
})
export class AiAgentExecutionModule {}
