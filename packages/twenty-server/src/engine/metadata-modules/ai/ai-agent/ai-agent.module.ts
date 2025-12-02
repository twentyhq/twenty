import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AiAgentRoleModule } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiChatRouterModule } from 'src/engine/metadata-modules/ai/ai-chat-router/ai-chat-router.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { AiToolsModule } from 'src/engine/metadata-modules/ai/ai-tools/ai-tools.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowToolsModule } from 'src/modules/workflow/workflow-tools/workflow-tools.module';

import { AgentResolver } from './agent.resolver';
import { AgentService } from './agent.service';

import { AgentEntity } from './entities/agent.entity';
import { AgentActorContextService } from './services/agent-actor-context.service';
import { AgentExecutionService } from './services/agent-execution.service';
import { AgentModelConfigService } from './services/agent-model-config.service';
import { AgentPlanExecutorService } from './services/agent-plan-executor.service';
import { AgentTitleGenerationService } from './services/agent-title-generation.service';
import { AgentToolGeneratorService } from './services/agent-tool-generator.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, RoleEntity, RoleTargetEntity]),
    AiModelsModule,
    AiToolsModule,
    AiBillingModule,
    AiAgentRoleModule,
    ThrottlerModule,
    AuditModule,
    FeatureFlagModule,
    FileUploadModule,
    FileModule,
    ObjectMetadataModule,
    PermissionsModule,
    AiChatRouterModule,
    WorkspaceCacheStorageModule,
    TokenModule,
    WorkspaceDomainsModule,
    WorkflowToolsModule,
    UserWorkspaceModule,
    UserRoleModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AgentResolver,
    AgentService,
    AgentExecutionService,
    AgentModelConfigService,
    AgentPlanExecutorService,
    AgentToolGeneratorService,
    AgentTitleGenerationService,
    AgentActorContextService,
  ],
  exports: [
    AgentService,
    AgentExecutionService,
    AgentPlanExecutorService,
    AgentToolGeneratorService,
    AgentTitleGenerationService,
    AgentActorContextService,
    AgentModelConfigService,
    TypeOrmModule.forFeature([AgentEntity]),
  ],
})
export class AiAgentModule {}
