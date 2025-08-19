import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiController } from 'src/engine/core-modules/ai/controllers/ai.controller';
import { McpController } from 'src/engine/core-modules/ai/controllers/mcp.controller';
import { AIBillingService } from 'src/engine/core-modules/ai/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { AiService } from 'src/engine/core-modules/ai/services/ai.service';
import { McpService } from 'src/engine/core-modules/ai/services/mcp.service';
import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ToolRegistryService } from 'src/engine/core-modules/tool/services/tool-registry.service';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { WorkflowBuilderModule } from 'src/modules/workflow/workflow-builder/workflow-builder.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

import { WORKFLOW_TOOL_PROVIDER } from './constants/workflow-tool.constants';
import { WorkflowToolWorkspaceService } from './services/workflow-tool.workspace-service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity], 'core'),
    TokenModule,
    FeatureFlagModule,
    ObjectMetadataModule,
    WorkspacePermissionsCacheModule,
    WorkspaceCacheStorageModule,
    UserRoleModule,
    TwentyORMModule,
    MessagingModule,
    PermissionsModule,
    WorkflowBuilderModule,
    WorkflowTriggerModule,
  ],
  controllers: [AiController, McpController],
  providers: [
    AiService,
    AiModelRegistryService,
    ToolService,
    ToolAdapterService,
    ToolRegistryService,
    AIBillingService,
    McpService,
    SendEmailTool,
    WorkflowToolWorkspaceService,
    {
      provide: WORKFLOW_TOOL_PROVIDER,
      useClass: WorkflowToolWorkspaceService,
    },
  ],
  exports: [
    AiService,
    AiModelRegistryService,
    AIBillingService,
    ToolService,
    ToolAdapterService,
    ToolRegistryService,
    McpService,
    SendEmailTool,
    WORKFLOW_TOOL_PROVIDER,
  ],
})
export class AiModule {}
