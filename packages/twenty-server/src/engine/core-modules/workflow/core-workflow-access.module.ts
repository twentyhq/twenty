import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

// Own module: the command menu and the workflow API both need it and already depend on each other.
@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([WorkflowEntity, WorkflowVersionEntity]),
  ],
  providers: [
    CoreWorkflowAccessService,
    provideWorkspaceScopedRepository(WorkflowEntity),
    provideWorkspaceScopedRepository(WorkflowVersionEntity),
  ],
  exports: [CoreWorkflowAccessService],
})
export class CoreWorkflowAccessModule {}
