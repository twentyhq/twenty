import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { PendingWakeUpModule } from 'src/engine/core-modules/pending-wake-up/pending-wake-up.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentRunConversationModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/agent-run-conversation.module';
import { AgentRunSuspensionEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run-suspension.entity';
import { ContinueAgentRunJob } from 'src/engine/metadata-modules/ai/ai-agent-execution/jobs/continue-agent-run.job';
import { AgentMessagePartResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-message-part.resolver';
import { AgentMessageResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-message.resolver';
import { AgentRunResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-run.resolver';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunPendingWakeUpHandlerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-pending-wake-up-handler.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { RunAgentAttachmentService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-attachment.service';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    AgentHistoryModule,
    AgentRunConversationModule,
    AiBillingModule,
    AiModelsModule,
    AiAgentModule,
    ApplicationLookupModule,
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
      RoleTargetEntity,
      WorkspaceEntity,
    ]),
  ],
  providers: [
    AgentAsyncExecutorService,
    AgentActorContextService,
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
    provideWorkspaceScopedRepository(RoleTargetEntity),
    provideWorkspaceScopedRepository(AgentEntity),
    provideWorkspaceScopedRepository(AgentRunSuspensionEntity),
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [
    AgentAsyncExecutorService,
    AgentActorContextService,
    AgentRunConversationModule,
    AgentRunnerService,
  ],
})
export class AiAgentExecutionModule {}
