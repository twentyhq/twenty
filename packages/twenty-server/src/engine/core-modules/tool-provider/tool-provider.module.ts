import { forwardRef, Module } from '@nestjs/common';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { ToolGeneratorModule } from 'src/engine/core-modules/tool-generator/tool-generator.module';
import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { ActionToolProvider } from 'src/engine/core-modules/tool-provider/providers/action-tool.provider';
import { DashboardToolProvider } from 'src/engine/core-modules/tool-provider/providers/dashboard-tool.provider';
import { DatabaseToolProvider } from 'src/engine/core-modules/tool-provider/providers/database-tool.provider';
import { MetadataToolProvider } from 'src/engine/core-modules/tool-provider/providers/metadata-tool.provider';
import { NativeModelToolProvider } from 'src/engine/core-modules/tool-provider/providers/native-model-tool.provider';
import { ServerlessFunctionToolProvider } from 'src/engine/core-modules/tool-provider/providers/serverless-function-tool.provider';
import { ViewToolProvider } from 'src/engine/core-modules/tool-provider/providers/view-tool.provider';
import { WorkflowToolProvider } from 'src/engine/core-modules/tool-provider/providers/workflow-tool.provider';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
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
    ToolGeneratorModule,
    RecordCrudModule,
    AiModelsModule,
    forwardRef(() => AiAgentExecutionModule),
    ObjectMetadataModule,
    FieldMetadataModule,
    PermissionsModule,
    ViewModule,
    WorkspaceCacheModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ServerlessFunctionModule,
    UserRoleModule,
  ],
  providers: [
    ToolIndexResolver,
    ActionToolProvider,
    DashboardToolProvider,
    DatabaseToolProvider,
    MetadataToolProvider,
    NativeModelToolProvider,
    ServerlessFunctionToolProvider,
    ViewToolProvider,
    WorkflowToolProvider,
    {
      provide: TOOL_PROVIDERS,
      useFactory: (
        actionProvider: ActionToolProvider,
        dashboardProvider: DashboardToolProvider,
        databaseProvider: DatabaseToolProvider,
        metadataProvider: MetadataToolProvider,
        nativeModelProvider: NativeModelToolProvider,
        serverlessFunctionProvider: ServerlessFunctionToolProvider,
        viewProvider: ViewToolProvider,
        workflowProvider: WorkflowToolProvider,
      ) => [
        actionProvider,
        dashboardProvider,
        databaseProvider,
        metadataProvider,
        nativeModelProvider,
        serverlessFunctionProvider,
        viewProvider,
        workflowProvider,
      ],
      inject: [
        ActionToolProvider,
        DashboardToolProvider,
        DatabaseToolProvider,
        MetadataToolProvider,
        NativeModelToolProvider,
        ServerlessFunctionToolProvider,
        ViewToolProvider,
        WorkflowToolProvider,
      ],
    },
    ToolRegistryService,
  ],
  exports: [ToolRegistryService],
})
export class ToolProviderModule {}
