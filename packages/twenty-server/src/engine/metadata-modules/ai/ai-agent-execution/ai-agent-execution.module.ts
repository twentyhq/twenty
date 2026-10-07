import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { PendingWakeUpModule } from 'src/engine/core-modules/pending-wake-up/pending-wake-up.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentRunSuspensionEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run-suspension.entity';
import { ContinueAgentRunJob } from 'src/engine/metadata-modules/ai/ai-agent-execution/jobs/continue-agent-run.job';
import { AgentMessagePartResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-message-part.resolver';
import { AgentMessageResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-message.resolver';
import { AgentRunResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-run.resolver';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentCallerInboxService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-inbox.service';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentCallerConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-conversation.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentRunPendingWakeUpHandlerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-pending-wake-up-handler.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { RunAgentAttachmentService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-attachment.service';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AiAgentRoleModule } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    AgentChatThreadLifecycleModule,
    AgentChatThreadModule,
    AgentHistoryModule,
    AiBillingModule,
    AiAgentModule,
    AiAgentRoleModule,
    ApplicationLookupModule,
    CacheLockModule,
    FileUrlModule,
    MetricsModule,
    PendingWakeUpModule,
    UserWorkspaceModule,
    UserRoleModule,
    PermissionsModule,
    ToolProviderModule,
    TypeOrmModule.forFeature([
      AgentEntity,
      AgentRunSuspensionEntity,
      FileEntity,
      WorkspaceEntity,
    ]),
  ],
  providers: [
    AgentAsyncExecutorService,
    AgentCallerInboxService,
    AgentActorContextService,
    AgentCallerConversationService,
    AgentRunCallerHandlerRegistryService,
    AgentRunConversationService,
    AgentRunSuspensionService,
    AiGraphqlApiExceptionInterceptor,
    AgentMessagePartResolver,
    AgentMessageResolver,
    AgentRunResolver,
    AgentRunService,
    AgentRunnerService,
    // continues suspended runs once answered or woken up, on the server and the worker alike
    AgentRunPendingWakeUpHandlerService,
    ContinueAgentRunJob,
    RunAgentAttachmentService,
    provideWorkspaceScopedRepository(AgentEntity),
    provideWorkspaceScopedRepository(AgentRunSuspensionEntity),
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [
    AgentAsyncExecutorService,
    AgentCallerInboxService,
    AgentActorContextService,
    AgentCallerConversationService,
    AgentRunCallerHandlerRegistryService,
    AgentRunConversationService,
    AgentRunSuspensionService,
    AgentRunnerService,
  ],
})
export class AiAgentExecutionModule {}
