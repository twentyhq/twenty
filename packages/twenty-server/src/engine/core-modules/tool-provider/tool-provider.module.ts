import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { ActionToolProvider } from 'src/engine/core-modules/tool-provider/providers/action-tool.provider';
import { DatabaseToolProvider } from 'src/engine/core-modules/tool-provider/providers/database-tool.provider';
import { LogicFunctionToolProvider } from 'src/engine/core-modules/tool-provider/providers/logic-function-tool.provider';
import { MetadataToolProvider } from 'src/engine/core-modules/tool-provider/providers/metadata-tool.provider';
import { NavigationMenuItemToolProvider } from 'src/engine/core-modules/tool-provider/providers/navigation-menu-item-tool.provider';
import { QueryToolProvider } from 'src/engine/core-modules/tool-provider/providers/query-tool.provider';
import { ViewToolProvider } from 'src/engine/core-modules/tool-provider/providers/view-tool.provider';
import { WebhookToolProvider } from 'src/engine/core-modules/tool-provider/providers/webhook-tool.provider';
import { WorkflowToolProvider } from 'src/engine/core-modules/tool-provider/providers/workflow-tool.provider';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { NavigationMenuItemModule } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewSortModule } from 'src/engine/metadata-modules/view-sort/view-sort.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WebhookModule } from 'src/engine/metadata-modules/webhook/webhook.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

import { ToolIndexResolver } from './resolvers/tool-index.resolver';
import { ToolRegistryService } from './services/tool-registry.service';

// NOTE: This module does NOT import WorkflowToolsModule or DashboardToolsModule
// directly: their service graphs transitively reach AiAgentExecutionModule which
// forwardRef's back into ToolProviderModule. Those two @Global() modules provide
// a service token that their respective providers consume via @Optional()
// @Inject, breaking the cycle.
//
// Webhook and NavigationMenuItem do NOT have that cycle, so we import their
// entity modules directly and the providers inject the services the normal way
// (same pattern as views/objects/metadata).

@Module({
  imports: [
    ToolModule,
    RecordCrudModule,
    AiModelsModule,
    forwardRef(() => AiAgentExecutionModule),
    ObjectMetadataModule,
    FieldMetadataModule,
    PermissionsModule,
    ViewModule,
    ViewFieldModule,
    ViewFilterModule,
    ViewSortModule,
    WorkspaceCacheModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    LogicFunctionModule,
    NavigationMenuItemModule,
    WebhookModule,
    UserRoleModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    ToolIndexResolver,
    ToolExecutorService,
    ActionToolProvider,
    DatabaseToolProvider,
    QueryToolProvider,
    MetadataToolProvider,
    NavigationMenuItemToolProvider,
    LogicFunctionToolProvider,
    ViewToolProvider,
    WebhookToolProvider,
    WorkflowToolProvider,
    {
      // TOOL_PROVIDERS contains only providers implementing ToolProvider
      // (registry tools with descriptors). The native tool binder is a
      // parallel concept and is exported for surfaces that bind SDK-native
      // tools directly into their model ToolSet.
      provide: TOOL_PROVIDERS,
      useFactory: (
        actionProvider: ActionToolProvider,
        databaseProvider: DatabaseToolProvider,
        queryProvider: QueryToolProvider,
        metadataProvider: MetadataToolProvider,
        logicFunctionProvider: LogicFunctionToolProvider,
        navigationMenuItemProvider: NavigationMenuItemToolProvider,
        viewProvider: ViewToolProvider,
        webhookProvider: WebhookToolProvider,
        workflowProvider: WorkflowToolProvider,
      ) => [
        actionProvider,
        databaseProvider,
        queryProvider,
        metadataProvider,
        logicFunctionProvider,
        navigationMenuItemProvider,
        viewProvider,
        webhookProvider,
        workflowProvider,
      ],
      inject: [
        ActionToolProvider,
        DatabaseToolProvider,
        QueryToolProvider,
        MetadataToolProvider,
        LogicFunctionToolProvider,
        NavigationMenuItemToolProvider,
        ViewToolProvider,
        WebhookToolProvider,
        WorkflowToolProvider,
      ],
    },
    ToolRegistryService,
  ],
  exports: [ToolRegistryService],
})
export class ToolProviderModule {}
