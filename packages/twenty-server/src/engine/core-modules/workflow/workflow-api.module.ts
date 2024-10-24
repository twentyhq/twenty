import { Module } from '@nestjs/common';

import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-trigger.resolver';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';
import { WorkflowResolver } from 'src/engine/core-modules/workflow/resolvers/workflow.resolver';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { CodeIntrospectionModule } from 'src/modules/code-introspection/code-introspection.module';

@Module({
  imports: [
    WorkflowTriggerModule,
    ServerlessFunctionModule,
    CodeIntrospectionModule,
  ],
  providers: [WorkflowTriggerResolver, WorkflowResolver],
})
export class WorkflowApiModule {}
