import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentChatController } from 'src/engine/metadata-modules/agent/agent-chat.controller';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { AgentChatMessageEntity } from './agent-chat-message.entity';
import { AgentChatThreadEntity } from './agent-chat-thread.entity';
import { AgentChatService } from './agent-chat.service';
import { AgentExecutionService } from './agent-execution.service';
import { AgentStreamingService } from './agent-streaming.service';
import { AgentToolService } from './agent-tool.service';
import { AgentEntity } from './agent.entity';
import { AgentResolver } from './agent.resolver';
import { AgentService } from './agent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        AgentEntity,
        RoleEntity,
        RoleTargetsEntity,
        AgentChatMessageEntity,
        AgentChatThreadEntity,
        UserWorkspace,
      ],
      'core',
    ),
    AiModule,
    ThrottlerModule,
    AuditModule,
    FeatureFlagModule,
    ObjectMetadataModule,
    WorkspacePermissionsCacheModule,
    WorkspaceCacheStorageModule,
    TokenModule,
  ],
  controllers: [AgentChatController],
  providers: [
    AgentResolver,
    AgentService,
    AgentExecutionService,
    AgentToolService,
    AgentChatService,
    AgentStreamingService,
  ],
  exports: [
    AgentService,
    AgentExecutionService,
    AgentToolService,
    AgentChatService,
    AgentStreamingService,
    TypeOrmModule.forFeature(
      [AgentEntity, AgentChatMessageEntity, AgentChatThreadEntity],
      'core',
    ),
  ],
})
export class AgentModule {}
