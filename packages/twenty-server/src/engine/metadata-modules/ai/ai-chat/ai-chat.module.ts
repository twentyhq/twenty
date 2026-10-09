import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatStreamStateModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-stream-state.module';
import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';
import { AiChatUsageService } from 'src/engine/metadata-modules/ai/ai-chat/services/ai-chat-usage.service';
import { AiChatUsageResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/ai-chat-usage.resolver';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { CodeModeModule } from 'src/engine/core-modules/code-mode/code-mode.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SkillModule } from 'src/engine/metadata-modules/skill/skill.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { DashboardToolsModule } from 'src/modules/dashboard/tools/dashboard-tools.module';

import { AgentInboxProposalService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox-proposal.service';
import { StreamAgentChatJob } from 'src/engine/metadata-modules/ai/ai-chat/jobs/stream-agent-chat.job';
import { AgentChatResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat.resolver';
import { AgentChatThreadParticipantResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat-thread-participant.resolver';
import { AgentChatSubscriptionResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat-subscription.resolver';
import { AgentInboxResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-inbox.resolver';
import { WorkspaceSetupChatResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/workspace-setup-chat.resolver';
import { WorkspaceSetupChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/workspace-setup-chat.service';
import { AgentChatCancelSubscriberService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-cancel-subscriber.service';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { AgentChatTurnPreflightService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-preflight.service';
import { AgentTitleGenerationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-title-generation.service';
import { ChatExecutionService } from 'src/engine/metadata-modules/ai/ai-chat/services/chat-execution.service';
import { MessagePruningService } from 'src/engine/metadata-modules/ai/ai-chat/services/message-pruning.service';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';

@Module({
  imports: [
    AgentChatStreamStateModule,
    AgentChatThreadLifecycleModule,
    AgentChatThreadModule,
    AgentHistoryModule,
    UsageLimitModule,
    TypeOrmModule.forFeature([FileEntity, WorkspaceEntity]),
    AiAgentExecutionModule,
    BillingModule,
    CodeModeModule,
    FeatureFlagModule,
    FileModule,
    PermissionsModule,
    SkillModule,
    WorkspaceCacheModule,
    WorkspaceDomainsModule,
    UserWorkspaceModule,
    AiBillingModule,
    MetricsModule,
    ToolProviderModule,
    DashboardToolsModule,
  ],
  providers: [
    AgentChatActorService,
    AiChatUsageService,
    AiChatUsageResolver,
    AgentChatCancelSubscriberService,
    AgentChatResolver,
    AgentChatThreadParticipantResolver,
    AgentChatSubscriptionResolver,
    WorkspaceSetupChatResolver,
    AgentInboxResolver,
    AgentInboxProposalService,
    AgentChatService,
    AgentChatThreadTargetService,
    AgentChatStreamingService,
    AgentChatTurnPreflightService,
    WorkspaceSetupChatService,
    AgentTitleGenerationService,
    ChatExecutionService,
    MessagePruningService,
    StreamAgentChatJob,
    SystemPromptBuilderService,
    provideWorkspaceScopedRepository(FileEntity),
  ],
  exports: [
    AgentChatThreadModule,
    AgentChatActorService,
    AgentChatService,
    AgentChatStreamingService,
    AgentChatTurnPreflightService,
  ],
})
export class AiChatModule {}
