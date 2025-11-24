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
import { AiAgentModule } from 'src/engine/metadata-modules/ai-agent/ai-agent.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai-billing/ai-billing.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai-models/ai-models.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';

import { AgentChatController } from './controllers/agent-chat.controller';
import { AgentChatMessagePartEntity } from './entities/agent-chat-message-part.entity';
import { AgentChatMessageEntity } from './entities/agent-chat-message.entity';
import { AgentChatThreadEntity } from './entities/agent-chat-thread.entity';
import { AgentChatResolver } from './resolvers/agent-chat.resolver';
import { AgentChatService } from './services/agent-chat.service';
import { AgentStreamingService } from './services/agent-streaming.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentChatMessageEntity,
      AgentChatMessagePartEntity,
      AgentChatThreadEntity,
      FileEntity,
      UserWorkspaceEntity,
    ]),
    AiModelsModule,
    AiBillingModule,
    AiAgentModule,
    ThrottlerModule,
    FeatureFlagModule,
    FileUploadModule,
    FileModule,
    PermissionsModule,
    WorkspacePermissionsCacheModule,
    TokenModule,
    UserWorkspaceModule,
  ],
  controllers: [AgentChatController],
  providers: [AgentChatResolver, AgentChatService, AgentStreamingService],
  exports: [
    AgentChatService,
    AgentStreamingService,
    TypeOrmModule.forFeature([
      AgentChatMessageEntity,
      AgentChatMessagePartEntity,
      AgentChatThreadEntity,
    ]),
  ],
})
export class AiChatModule {}
