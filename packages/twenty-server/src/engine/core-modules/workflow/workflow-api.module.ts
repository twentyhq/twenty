import { Module } from '@nestjs/common';

import { WorkflowBuilderResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-builder.resolver';
import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-trigger.resolver';
import { WorkflowVersionStepResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version-step.resolver';
import { WorkflowVersionResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-version.resolver';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowBuilderModule } from 'src/modules/workflow/workflow-builder/workflow-builder.module';
import { WorkflowVersionModule } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [
    WorkflowTriggerModule,
    WorkflowBuilderModule,
    WorkflowCommonModule,
    WorkflowVersionModule,
  ],
  providers: [
    WorkflowTriggerResolver,
    WorkflowBuilderResolver,
    WorkflowVersionStepResolver,
    WorkflowVersionResolver,
  ],
})
export class WorkflowApiModule {}
