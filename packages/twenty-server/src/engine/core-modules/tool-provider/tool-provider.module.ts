import { forwardRef, Module } from '@nestjs/common';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { ToolGeneratorModule } from 'src/engine/core-modules/tool-generator/tool-generator.module';
import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { ActionToolProvider } from 'src/engine/core-modules/tool-provider/providers/action-tool.provider';
import { DatabaseToolProvider } from 'src/engine/core-modules/tool-provider/providers/database-tool.provider';
import { MetadataToolProvider } from 'src/engine/core-modules/tool-provider/providers/metadata-tool.provider';
import { WorkflowToolProvider } from 'src/engine/core-modules/tool-provider/providers/workflow-tool.provider';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

import { ToolProviderService } from './services/tool-provider.service';
import { ToolRegistryService } from './services/tool-registry.service';

// NOTE: This module does NOT import WorkflowToolsModule to avoid circular dependency:
// ToolProviderModule -> WorkflowToolsModule -> WorkflowTriggerModule
// -> WorkflowRunnerModule -> WorkflowExecutorModule -> AiAgentActionModule
// -> AiAgentExecutionModule -> ToolProviderModule
//
// Instead, WorkflowToolWorkspaceService is an optional dependency that must be
// provided by the importing module (e.g., AiChatModule imports WorkflowToolsModule).

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
    WorkspaceCacheModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    ActionToolProvider,
    DatabaseToolProvider,
    MetadataToolProvider,
    WorkflowToolProvider,
    {
      provide: TOOL_PROVIDERS,
      useFactory: (
        actionProvider: ActionToolProvider,
        databaseProvider: DatabaseToolProvider,
        metadataProvider: MetadataToolProvider,
        workflowProvider: WorkflowToolProvider,
      ) => [actionProvider, databaseProvider, metadataProvider, workflowProvider],
      inject: [
        ActionToolProvider,
        DatabaseToolProvider,
        MetadataToolProvider,
        WorkflowToolProvider,
      ],
    },
    ToolProviderService,
    ToolRegistryService,
  ],
  exports: [ToolProviderService, ToolRegistryService],
})
export class ToolProviderModule {}
