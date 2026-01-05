import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { SkillModule } from 'src/engine/metadata-modules/skill/skill.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { DashboardToolsModule } from 'src/modules/dashboard/tools/dashboard-tools.module';
import { WorkflowToolsModule } from 'src/modules/workflow/workflow-tools/workflow-tools.module';

import { AgentChatController } from './controllers/agent-chat.controller';
import { AgentChatThreadEntity } from './entities/agent-chat-thread.entity';
import { AgentChatResolver } from './resolvers/agent-chat.resolver';
import { AgentChatStreamingService } from './services/agent-chat-streaming.service';
import { AgentChatService } from './services/agent-chat.service';
import { AgentTitleGenerationService } from './services/agent-title-generation.service';
import { ChatExecutionService } from './services/chat-execution.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentChatThreadEntity,
      FileEntity,
      UserWorkspaceEntity,
    ]),
    AiAgentExecutionModule,
    BillingModule,
    ThrottlerModule,
    FeatureFlagModule,
    FileUploadModule,
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
  controllers: [AgentChatController],
  providers: [
    AgentChatResolver,
    AgentChatService,
    AgentChatStreamingService,
    AgentTitleGenerationService,
    ChatExecutionService,
  ],
  exports: [
    AgentChatService,
    AgentChatStreamingService,
    TypeOrmModule.forFeature([AgentChatThreadEntity]),
  ],
})
export class AiChatModule {}
