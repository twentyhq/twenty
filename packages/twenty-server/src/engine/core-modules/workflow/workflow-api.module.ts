import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { WorkflowTriggerController } from 'src/engine/core-modules/workflow/controllers/workflow-trigger.controller';
import { WorkflowBuilderResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-builder.resolver';
import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-trigger.resolver';
import { WorkflowVersionEdgeResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version-edge.resolver';
import { WorkflowVersionStepResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version-step.resolver';
import { WorkflowVersionResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version.resolver';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowBuilderModule } from 'src/modules/workflow/workflow-builder/workflow-builder.module';
import { CodeStepBuildModule } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/code-step-build.module';
import { WorkflowVersionModule } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    FeatureFlagModule,
    WorkflowTriggerModule,
    WorkflowBuilderModule,
    WorkflowCommonModule,
    WorkflowVersionModule,
    WorkflowRunModule,
    WorkflowRunnerModule,
    PermissionsModule,
    ToolModule,
    LogicFunctionExecutorModule,
    LogicFunctionModule,
    CodeStepBuildModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [WorkflowTriggerController],
  providers: [
    WorkflowTriggerResolver,
    WorkflowBuilderResolver,
    WorkflowVersionStepResolver,
    WorkflowVersionEdgeResolver,
    WorkflowVersionResolver,
  ],
})
export class WorkflowApiModule {}
