import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentRoleModule } from 'src/engine/metadata-modules/agent-role/agent-role.module';
import { AgentChatController } from 'src/engine/metadata-modules/agent/agent-chat.controller';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkflowToolsModule } from 'src/modules/workflow/workflow-tools/workflow-tools.module';

import { AgentChatMessagePartEntity } from './agent-chat-message-part.entity';
import { AgentChatMessageEntity } from './agent-chat-message.entity';
import { AgentChatThreadEntity } from './agent-chat-thread.entity';
import { AgentChatResolver } from './agent-chat.resolver';
import { AgentChatService } from './agent-chat.service';
import { AgentExecutionService } from './agent-execution.service';
import { AgentHandoffExecutorService } from './agent-handoff-executor.service';
import { AgentHandoffToolService } from './agent-handoff-tool.service';
import { AgentHandoffEntity } from './agent-handoff.entity';
import { AgentHandoffService } from './agent-handoff.service';
import { AgentModelConfigService } from './agent-model-config.service';
import { AgentStreamingService } from './agent-streaming.service';
import { AgentTitleGenerationService } from './agent-title-generation.service';
import { AgentToolGeneratorService } from './agent-tool-generator.service';
import { AgentEntity } from './agent.entity';
import { AgentResolver } from './agent.resolver';
import { AgentService } from './agent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentEntity,
      AgentHandoffEntity,
      RoleEntity,
      RoleTargetsEntity,
      AgentChatMessageEntity,
      AgentChatMessagePartEntity,
      AgentChatThreadEntity,
      FileEntity,
      UserWorkspace,
    ]),
    AiModule,
    AgentRoleModule,
    ThrottlerModule,
    AuditModule,
    FeatureFlagModule,
    FileUploadModule,
    FileModule,
    ObjectMetadataModule,
    PermissionsModule,
    WorkspacePermissionsCacheModule,
    WorkspaceCacheStorageModule,
    TokenModule,
    DomainManagerModule,
    WorkflowToolsModule,
  ],
  controllers: [AgentChatController],
  providers: [
    AgentResolver,
    AgentChatResolver,
    AgentService,
    AgentExecutionService,
    AgentModelConfigService,
    AgentToolGeneratorService,
    AgentHandoffToolService,
    AgentChatService,
    AgentStreamingService,
    AgentTitleGenerationService,
    AgentHandoffExecutorService,
    AgentHandoffService,
  ],
  exports: [
    AgentService,
    AgentExecutionService,
    AgentToolGeneratorService,
    AgentHandoffToolService,
    AgentChatService,
    AgentStreamingService,
    AgentTitleGenerationService,
    TypeOrmModule.forFeature([
      AgentEntity,
      AgentChatMessageEntity,
      AgentChatMessagePartEntity,
      AgentChatThreadEntity,
    ]),
    AgentHandoffExecutorService,
    AgentHandoffService,
  ],
})
export class AgentModule {}
