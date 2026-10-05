import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessagePartResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-message-part.resolver';
import { AgentMessageResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-message.resolver';
import { AgentRunResolver } from 'src/engine/metadata-modules/ai/ai-agent-execution/resolvers/agent-run.resolver';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { RunAgentAttachmentService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-attachment.service';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    AgentHistoryModule,
    AiBillingModule,
    AiModelsModule,
    AiAgentModule,
    ApplicationLookupModule,
    BillingModule,
    CacheLockModule,
    FileUrlModule,
    WorkspaceDomainsModule,
    MetricsModule,
    UserWorkspaceModule,
    UserRoleModule,
    PermissionsModule,
    WorkspaceCacheModule,
    forwardRef(() => ToolProviderModule),
    TypeOrmModule.forFeature([
      AgentEntity,
      FileEntity,
      RoleTargetEntity,
      WorkspaceEntity,
    ]),
  ],
  providers: [
    AgentAsyncExecutorService,
    AgentActorContextService,
    AgentMessagePartResolver,
    AgentMessageResolver,
    AgentRunResolver,
    AgentRunConversationService,
    AgentRunService,
    RunAgentAttachmentService,
    provideWorkspaceScopedRepository(RoleTargetEntity),
    provideWorkspaceScopedRepository(AgentEntity),
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [AgentAsyncExecutorService, AgentActorContextService],
})
export class AiAgentExecutionModule {}
