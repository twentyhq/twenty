import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FilesFieldModule } from 'src/engine/core-modules/file/files-field/files-field.module';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { ActionToolProvider } from 'src/engine/core-modules/tool-provider/providers/action-tool.provider';
import { DashboardToolProvider } from 'src/engine/core-modules/tool-provider/providers/dashboard-tool.provider';
import { DatabaseToolProvider } from 'src/engine/core-modules/tool-provider/providers/database-tool.provider';
import { LogicFunctionToolProvider } from 'src/engine/core-modules/tool-provider/providers/logic-function-tool.provider';
import { WorkflowToolProvider } from 'src/engine/core-modules/tool-provider/providers/workflow-tool.provider';
import { DefinedToolRegistryService } from 'src/engine/core-modules/tool-provider/services/defined-tool-registry.service';
import { RecordFilesResolverService } from 'src/engine/core-modules/tool-provider/services/record-files-resolver.service';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AgentToolsModule } from 'src/engine/metadata-modules/ai/ai-agent/tools/agent-tools.module';
import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { NavigationMenuItemToolsModule } from 'src/engine/metadata-modules/navigation-menu-item/tools/navigation-menu-item-tools.module';
import { MetadataToolsModule } from 'src/engine/metadata-modules/object-metadata/tools/metadata-tools.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleToolsModule } from 'src/engine/metadata-modules/role/tools/role-tools.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { ViewToolsModule } from 'src/engine/metadata-modules/view/tools/view-tools.module';
import { WebhookToolsModule } from 'src/engine/metadata-modules/webhook/tools/webhook-tools.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { EmailingModule } from 'src/modules/emailing/emailing.module';

import { ToolIndexResolver } from './resolvers/tool-index.resolver';
import { ToolRegistryService } from './services/tool-registry.service';

// Workflow and Dashboard tools modules reach AiAgentExecutionModule, which imports this module,
// so their @Global() modules provide tokens consumed via @Optional() @Inject instead of being imported.

@Module({
  imports: [
    DiscoveryModule,
    ApplicationTranslationCatalogModule,
    ToolModule,
    RecordCrudModule,
    FeatureFlagModule,
    FilesFieldModule,
    PermissionsModule,
    ViewToolsModule,
    WorkspaceCacheModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    NavigationMenuItemToolsModule,
    WebhookToolsModule,
    RoleToolsModule,
    AgentToolsModule,
    UserRoleModule,
    MetadataToolsModule,
    EmailingModule,
    TypeOrmModule.forFeature([UserEntity, FileEntity]),
  ],
  providers: [
    ToolIndexResolver,
    DefinedToolRegistryService,
    ToolExecutorService,
    RecordFilesResolverService,
    provideWorkspaceScopedRepository(FileEntity),
    ActionToolProvider,
    DashboardToolProvider,
    DatabaseToolProvider,
    LogicFunctionToolProvider,
    WorkflowToolProvider,
    {
      provide: TOOL_PROVIDERS,
      useFactory: (
        actionProvider: ActionToolProvider,
        databaseProvider: DatabaseToolProvider,
        logicFunctionProvider: LogicFunctionToolProvider,
        workflowProvider: WorkflowToolProvider,
        dashboardProvider: DashboardToolProvider,
      ) => [
        actionProvider,
        databaseProvider,
        logicFunctionProvider,
        workflowProvider,
        dashboardProvider,
      ],
      inject: [
        ActionToolProvider,
        DatabaseToolProvider,
        LogicFunctionToolProvider,
        WorkflowToolProvider,
        DashboardToolProvider,
      ],
    },
    ToolRegistryService,
  ],
  exports: [ToolRegistryService],
})
export class ToolProviderModule {}
