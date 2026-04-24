import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { ActionToolProvider } from 'src/engine/core-modules/tool-provider/providers/action-tool.provider';
import { DashboardToolProvider } from 'src/engine/core-modules/tool-provider/providers/dashboard-tool.provider';
import { DatabaseToolProvider } from 'src/engine/core-modules/tool-provider/providers/database-tool.provider';
import { LogicFunctionToolProvider } from 'src/engine/core-modules/tool-provider/providers/logic-function-tool.provider';
import { MetadataToolProvider } from 'src/engine/core-modules/tool-provider/providers/metadata-tool.provider';
import { NativeToolBinderService } from 'src/engine/core-modules/tool-provider/native/native-tool-binder.service';
import { ViewFieldToolProvider } from 'src/engine/core-modules/tool-provider/providers/view-field-tool.provider';
import { ViewToolProvider } from 'src/engine/core-modules/tool-provider/providers/view-tool.provider';
import { WorkflowToolProvider } from 'src/engine/core-modules/tool-provider/providers/workflow-tool.provider';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewFilterModule } from 'src/engine/metadata-modules/view-filter/view-filter.module';
import { ViewSortModule } from 'src/engine/metadata-modules/view-sort/view-sort.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

import { ToolIndexResolver } from './resolvers/tool-index.resolver';
import { ToolRegistryService } from './services/tool-registry.service';

// NOTE: This module does NOT import WorkflowToolsModule or DashboardToolsModule to avoid
// circular dependencies. Instead, they are @Global() modules that provide their tokens.
// When imported anywhere in the app (e.g., AiChatModule), the tokens become available
// globally to their respective providers via @Optional() injection.

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
    UserRoleModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    ToolIndexResolver,
    ToolExecutorService,
    ActionToolProvider,
    DashboardToolProvider,
    DatabaseToolProvider,
    MetadataToolProvider,
    NativeToolBinderService,
    LogicFunctionToolProvider,
    ViewFieldToolProvider,
    ViewToolProvider,
    WorkflowToolProvider,
    {
      // TOOL_PROVIDERS contains only providers implementing ToolProvider
      // (registry tools with descriptors). The native tool binder is a
      // parallel concept and is injected directly into ToolRegistryService.
      provide: TOOL_PROVIDERS,
      useFactory: (
        actionProvider: ActionToolProvider,
        dashboardProvider: DashboardToolProvider,
        databaseProvider: DatabaseToolProvider,
        metadataProvider: MetadataToolProvider,
        logicFunctionProvider: LogicFunctionToolProvider,
        viewFieldProvider: ViewFieldToolProvider,
        viewProvider: ViewToolProvider,
        workflowProvider: WorkflowToolProvider,
      ) => [
        actionProvider,
        dashboardProvider,
        databaseProvider,
        metadataProvider,
        logicFunctionProvider,
        viewFieldProvider,
        viewProvider,
        workflowProvider,
      ],
      inject: [
        ActionToolProvider,
        DashboardToolProvider,
        DatabaseToolProvider,
        MetadataToolProvider,
        LogicFunctionToolProvider,
        ViewFieldToolProvider,
        ViewToolProvider,
        WorkflowToolProvider,
      ],
    },
    ToolRegistryService,
  ],
  exports: [ToolRegistryService],
})
export class ToolProviderModule {}
