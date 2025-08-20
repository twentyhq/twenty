import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkflowTriggerController } from 'src/engine/core-modules/workflow/controllers/workflow-trigger.controller';
import { WorkflowBuilderResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-builder.resolver';
import { WorkflowVersionStepResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version-step.resolver';
import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-trigger.resolver';
import { WorkflowVersionResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowBuilderModule } from 'src/modules/workflow/workflow-builder/workflow-builder.module';
import { WorkflowVersionModule } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';
import { WorkflowVersionEdgeResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version-edge.resolver';

@Module({
  imports: [
    FeatureFlagModule,
    WorkflowTriggerModule,
    WorkflowBuilderModule,
    WorkflowCommonModule,
    WorkflowVersionModule,
    WorkflowRunModule,
    PermissionsModule,
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
