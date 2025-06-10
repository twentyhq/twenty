import { Module } from '@nestjs/common';

import { WorkflowTriggerController } from 'src/engine/core-modules/workflow/controllers/workflow-trigger.controller';
import { WorkflowBuilderResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-builder.resolver';
import { WorkflowStepResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-step.resolver';
import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-trigger.resolver';
import { WorkflowVersionResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version.resolver';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowBuilderModule } from 'src/modules/workflow/workflow-builder/workflow-builder.module';
import { WorkflowVersionModule } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.module';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [
    WorkflowTriggerModule,
    WorkflowBuilderModule,
    WorkflowCommonModule,
    WorkflowVersionModule,
    WorkflowRunModule,
  ],
  controllers: [WorkflowTriggerController],
  providers: [
    WorkflowTriggerResolver,
    WorkflowBuilderResolver,
    WorkflowStepResolver,
    WorkflowVersionResolver,
  ],
})
export class WorkflowApiModule {}
