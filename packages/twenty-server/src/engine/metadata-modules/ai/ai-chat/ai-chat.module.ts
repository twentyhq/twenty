import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiChatRouterModule } from 'src/engine/metadata-modules/ai/ai-chat-router/ai-chat-router.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkflowToolsModule } from 'src/modules/workflow/workflow-tools/workflow-tools.module';

import { AgentChatController } from './controllers/agent-chat.controller';
import { AgentChatThreadEntity } from './entities/agent-chat-thread.entity';
import { AgentChatResolver } from './resolvers/agent-chat.resolver';
import { AgentChatRoutingService } from './services/agent-chat-routing.service';
import { AgentChatStreamingService } from './services/agent-chat-streaming.service';
import { AgentChatService } from './services/agent-chat.service';
import { AgentTitleGenerationService } from './services/agent-title-generation.service';
import { ChatToolsProviderService } from './services/chat-tools-provider.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentChatThreadEntity,
      FileEntity,
      UserWorkspaceEntity,
    ]),
    AiAgentModule,
    AiAgentExecutionModule,
    AiChatRouterModule,
    ThrottlerModule,
    FeatureFlagModule,
    FileUploadModule,
    FileModule,
    PermissionsModule,
    WorkspaceCacheStorageModule,
    TokenModule,
    UserWorkspaceModule,
    AiBillingModule,
    // Provides WorkflowToolWorkspaceService for ChatToolsProviderService
    // Workflow tools are only available in chat context, not in workflow executor (to avoid circular deps)
    WorkflowToolsModule,
    // Provides metadata tools factories for ChatToolsProviderService
    ObjectMetadataModule,
    FieldMetadataModule,
  ],
  controllers: [AgentChatController],
  providers: [
    AgentChatResolver,
    AgentChatService,
    AgentChatStreamingService,
    AgentChatRoutingService,
    AgentTitleGenerationService,
    ChatToolsProviderService,
  ],
  exports: [
    AgentChatService,
    AgentChatStreamingService,
    TypeOrmModule.forFeature([AgentChatThreadEntity]),
  ],
})
export class AiChatModule {}
