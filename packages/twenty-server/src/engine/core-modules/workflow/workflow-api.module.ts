import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-trigger.resolver';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';
import { WorkflowResolver } from 'src/engine/core-modules/workflow/resolvers/workflow.resolver';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { CodeIntrospectionModule } from 'src/modules/code-introspection/code-introspection.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkflowService } from 'src/engine/core-modules/workflow/services/workflow.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    WorkflowTriggerModule,
    ServerlessFunctionModule,
    CodeIntrospectionModule,
  ],
  providers: [WorkflowTriggerResolver, WorkflowResolver, WorkflowService],
})
export class WorkflowApiModule {}
