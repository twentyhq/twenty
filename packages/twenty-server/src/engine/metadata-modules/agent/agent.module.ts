import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { AgentChatController } from 'src/engine/metadata-modules/agent/agent-chat.controller';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { AgentChatMessageEntity } from './agent-chat-message.entity';
import { AgentChatThreadEntity } from './agent-chat-thread.entity';
import { AgentChatResolver } from './agent-chat.resolver';
import { AgentChatService } from './agent-chat.service';
import { AgentExecutionService } from './agent-execution.service';
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
      ],
      'core',
    ),
    AiModule,
    ThrottlerModule,
    AuditModule,
    forwardRef(() => AuthModule),
    FeatureFlagModule,
    ObjectMetadataModule,
    WorkspacePermissionsCacheModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [AgentChatController],
  providers: [
    AgentResolver,
    AgentService,
    AgentExecutionService,
    AgentToolService,
    AgentChatResolver,
    AgentChatService,
  ],
  exports: [
    AgentService,
    AgentExecutionService,
    AgentToolService,
    AgentChatService,
    TypeOrmModule.forFeature(
      [AgentEntity, AgentChatMessageEntity, AgentChatThreadEntity],
      'core',
    ),
  ],
})
export class AgentModule {}
