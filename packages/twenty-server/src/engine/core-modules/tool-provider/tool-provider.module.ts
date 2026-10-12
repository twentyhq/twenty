import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FilesFieldModule } from 'src/engine/core-modules/file/files-field/files-field.module';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { ActionToolProvider } from 'src/engine/core-modules/tool-provider/providers/action-tool.provider';
import { DashboardToolProvider } from 'src/engine/core-modules/tool-provider/providers/dashboard-tool.provider';
import { DatabaseToolProvider } from 'src/engine/core-modules/tool-provider/providers/database-tool.provider';
import { LogicFunctionToolProvider } from 'src/engine/core-modules/tool-provider/providers/logic-function-tool.provider';
import { MetadataToolProvider } from 'src/engine/core-modules/tool-provider/providers/metadata-tool.provider';
import { NavigationMenuItemToolProvider } from 'src/engine/core-modules/tool-provider/providers/navigation-menu-item-tool.provider';
import { RoleToolProvider } from 'src/engine/core-modules/tool-provider/providers/role-tool.provider';
import { ViewToolProvider } from 'src/engine/core-modules/tool-provider/providers/view-tool.provider';
import { WebhookToolProvider } from 'src/engine/core-modules/tool-provider/providers/webhook-tool.provider';
import { WorkflowToolProvider } from 'src/engine/core-modules/tool-provider/providers/workflow-tool.provider';
import { RecordFilesResolverService } from 'src/engine/core-modules/tool-provider/services/record-files-resolver.service';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { NavigationMenuItemModule } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewSortModule } from 'src/engine/metadata-modules/view-sort/view-sort.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WebhookModule } from 'src/engine/metadata-modules/webhook/webhook.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { EmailingModule } from 'src/modules/emailing/emailing.module';

import { ToolIndexResolver } from './resolvers/tool-index.resolver';
import { ToolRegistryService } from './services/tool-registry.service';

// Workflow and Dashboard tools modules reach AiAgentExecutionModule, which imports this module,
// so their @Global() modules provide tokens consumed via @Optional() @Inject instead of being imported.

@Module({
  imports: [
    ApplicationTranslationCatalogModule,
    ToolModule,
    RecordCrudModule,
    FilesFieldModule,
    ObjectMetadataModule,
    FieldMetadataModule,
    PermissionsModule,
    ViewModule,
    ViewFieldModule,
    ViewFilterModule,
    ViewSortModule,
    WorkspaceCacheModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    NavigationMenuItemModule,
    WebhookModule,
    RoleModule,
    UserRoleModule,
    EmailingModule,
    TypeOrmModule.forFeature([UserEntity, FileEntity]),
  ],
  providers: [
    ToolIndexResolver,
    ToolExecutorService,
    RecordFilesResolverService,
    provideWorkspaceScopedRepository(FileEntity),
    ActionToolProvider,
    DashboardToolProvider,
    DatabaseToolProvider,
    MetadataToolProvider,
    NavigationMenuItemToolProvider,
    LogicFunctionToolProvider,
    RoleToolProvider,
    ViewToolProvider,
    WebhookToolProvider,
    WorkflowToolProvider,
    {
      provide: TOOL_PROVIDERS,
      useFactory: (
        actionProvider: ActionToolProvider,
        databaseProvider: DatabaseToolProvider,
        metadataProvider: MetadataToolProvider,
        logicFunctionProvider: LogicFunctionToolProvider,
        navigationMenuItemProvider: NavigationMenuItemToolProvider,
        roleProvider: RoleToolProvider,
        viewProvider: ViewToolProvider,
        webhookProvider: WebhookToolProvider,
        workflowProvider: WorkflowToolProvider,
        dashboardProvider: DashboardToolProvider,
      ) => [
        actionProvider,
        databaseProvider,
        metadataProvider,
        logicFunctionProvider,
        navigationMenuItemProvider,
        roleProvider,
        viewProvider,
        webhookProvider,
        workflowProvider,
        dashboardProvider,
      ],
      inject: [
        ActionToolProvider,
        DatabaseToolProvider,
        MetadataToolProvider,
        LogicFunctionToolProvider,
        NavigationMenuItemToolProvider,
        RoleToolProvider,
        ViewToolProvider,
        WebhookToolProvider,
        WorkflowToolProvider,
        DashboardToolProvider,
      ],
    },
    ToolRegistryService,
  ],
  exports: [ToolRegistryService],
})
export class ToolProviderModule {}
