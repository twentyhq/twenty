import { Module } from '@nestjs/common';

import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-trigger.resolver';
import { WorkflowBuilderResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-builder.resolver';
import { WorkflowBuilderModule } from 'src/modules/workflow/workflow-builder/workflow-builder.module';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [WorkflowTriggerModule, WorkflowBuilderModule],
  providers: [WorkflowTriggerResolver, WorkflowBuilderResolver],
})
export class WorkflowApiModule {}
