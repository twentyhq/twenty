import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';
import { AiChatUsageService } from 'src/engine/metadata-modules/ai/ai-chat/services/ai-chat-usage.service';
import { AiChatUsageResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/ai-chat-usage.resolver';
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
import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SkillModule } from 'src/engine/metadata-modules/skill/skill.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { DashboardToolsModule } from 'src/modules/dashboard/tools/dashboard-tools.module';
import { WorkflowToolsModule } from 'src/modules/workflow/workflow-tools/workflow-tools.module';

import { AgentChatChannelMemberEntity } from './entities/agent-chat-channel-member.entity';
import { AgentChatChannelEntity } from './entities/agent-chat-channel.entity';
import { AgentChatThreadParticipantEntity } from './entities/agent-chat-thread-participant.entity';
import { AgentChatThreadEntity } from './entities/agent-chat-thread.entity';
import { StreamAgentChatJob } from './jobs/stream-agent-chat.job';
import { AgentChatChannelResolver } from './resolvers/agent-chat-channel.resolver';
import { AgentChatResolver } from './resolvers/agent-chat.resolver';
import { AgentChatSubscriptionResolver } from './resolvers/agent-chat-subscription.resolver';
import { WorkspaceSetupChatResolver } from './resolvers/workspace-setup-chat.resolver';
import { WorkspaceSetupChatService } from './services/workspace-setup-chat.service';
import { AgentChatCancelSubscriberService } from './services/agent-chat-cancel-subscriber.service';
import { AgentChatEventPublisherService } from './services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from './services/agent-chat-stream-heartbeat.service';
import { AgentChatStreamingService } from './services/agent-chat-streaming.service';
import { AgentChatChannelService } from './services/agent-chat-channel.service';
import { AgentChatThreadParticipantService } from './services/agent-chat-thread-participant.service';
import { AgentChatService } from './services/agent-chat.service';
import { AgentTitleGenerationService } from './services/agent-title-generation.service';
import { ChatExecutionService } from './services/chat-execution.service';
import { MessagePruningService } from './services/message-pruning.service';
import { SystemPromptBuilderService } from './services/system-prompt-builder.service';

@Module({
  imports: [
    UsageLimitModule,
    TypeOrmModule.forFeature([
      AgentChatThreadEntity,
      AgentChatThreadParticipantEntity,
      AgentChatChannelEntity,
      AgentChatChannelMemberEntity,
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
    TokenModule,
    UserWorkspaceModule,
    AiBillingModule,
    MetricsModule,
    ToolProviderModule,
    DashboardToolsModule,
    WorkflowToolsModule,
  ],
  providers: [
    AiChatUsageService,
    AiChatUsageResolver,
    AgentChatCancelSubscriberService,
    AgentChatEventPublisherService,
    AgentChatStreamHeartbeatService,
    AgentChatResolver,
    AgentChatChannelResolver,
    AgentChatSubscriptionResolver,
    WorkspaceSetupChatResolver,
    AgentChatService,
    AgentChatStreamingService,
    AgentChatThreadParticipantService,
    AgentChatChannelService,
    WorkspaceSetupChatService,
    AgentTitleGenerationService,
    ChatExecutionService,
    MessagePruningService,
    StreamAgentChatJob,
    SystemPromptBuilderService,
    AiGraphqlApiExceptionInterceptor,
    provideWorkspaceScopedRepository(AgentChatThreadEntity),
    provideWorkspaceScopedRepository(AgentChatThreadParticipantEntity),
    provideWorkspaceScopedRepository(AgentChatChannelEntity),
    provideWorkspaceScopedRepository(AgentChatChannelMemberEntity),
    provideWorkspaceScopedRepository(AgentTurnEntity),
    provideWorkspaceScopedRepository(AgentMessageEntity),
    provideWorkspaceScopedRepository(AgentMessagePartEntity),
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [
    AgentChatService,
    AgentChatStreamingService,
    AgentChatThreadParticipantService,
    AgentChatChannelService,
    TypeOrmModule.forFeature([AgentChatThreadEntity]),
  ],
})
export class AiChatModule {}
