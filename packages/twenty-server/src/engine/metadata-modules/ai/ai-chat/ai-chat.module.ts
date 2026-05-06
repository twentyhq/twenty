import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SkillModule } from 'src/engine/metadata-modules/skill/skill.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { DashboardToolsModule } from 'src/modules/dashboard/tools/dashboard-tools.module';
import { WorkflowToolsModule } from 'src/modules/workflow/workflow-tools/workflow-tools.module';

import { AgentChatThreadEntity } from './entities/agent-chat-thread.entity';
import { StreamAgentChatJob } from './jobs/stream-agent-chat.job';
import { AgentChatResolver } from './resolvers/agent-chat.resolver';
import { AgentChatSubscriptionResolver } from './resolvers/agent-chat-subscription.resolver';
import { AgentChatCancelSubscriberService } from './services/agent-chat-cancel-subscriber.service';
import { AgentChatEventPublisherService } from './services/agent-chat-event-publisher.service';
import { AgentChatStreamingService } from './services/agent-chat-streaming.service';
import { AgentChatService } from './services/agent-chat.service';
import { AgentTitleGenerationService } from './services/agent-title-generation.service';
import { ChatExecutionService } from './services/chat-execution.service';
import { MessagePruningService } from './services/message-pruning.service';
import { SystemPromptBuilderService } from './services/system-prompt-builder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentChatThreadEntity,
      FileEntity,
      UserWorkspaceEntity,
      WorkspaceEntity,
    ]),
    AiAgentExecutionModule,
    BillingModule,
    ThrottlerModule,
    FileModule,
    PermissionsModule,
    SkillModule,
    WorkspaceCacheStorageModule,
    WorkspaceCacheModule,
    WorkspaceDomainsModule,
    TwentyORMModule,
    TokenModule,
    UserWorkspaceModule,
    AiBillingModule,
    ToolProviderModule,
    DashboardToolsModule,
    WorkflowToolsModule,
  ],
  providers: [
    AgentChatCancelSubscriberService,
    AgentChatEventPublisherService,
    AgentChatResolver,
    AgentChatSubscriptionResolver,
    AgentChatService,
    AgentChatStreamingService,
    AgentTitleGenerationService,
    ChatExecutionService,
    MessagePruningService,
    StreamAgentChatJob,
    SystemPromptBuilderService,
    AiGraphqlApiExceptionInterceptor,
  ],
  exports: [
    AgentChatService,
    AgentChatStreamingService,
    TypeOrmModule.forFeature([AgentChatThreadEntity]),
  ],
})
export class AiChatModule {}
