import { forwardRef, Module } from '@nestjs/common';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { ToolGeneratorModule } from 'src/engine/core-modules/tool-generator/tool-generator.module';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { ToolProviderService } from './services/tool-provider.service';

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
    // forwardRef needed: AiAgentExecutionModule imports ToolProviderModule
    forwardRef(() => AiAgentExecutionModule),
    ObjectMetadataModule,
    FieldMetadataModule,
    PermissionsModule,
  ],
  providers: [ToolProviderService],
  exports: [ToolProviderService],
})
export class ToolProviderModule {}
