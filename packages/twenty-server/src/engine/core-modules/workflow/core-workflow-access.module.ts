import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

// The rule is reached from the command menu as well as from the workflow API,
// and those two modules already depend on each other, so it lives on its own.
@Module({
  imports: [TypeOrmModule.forFeature([WorkflowEntity, WorkflowVersionEntity])],
  providers: [
    CoreWorkflowAccessService,
    provideWorkspaceScopedRepository(WorkflowEntity),
    provideWorkspaceScopedRepository(WorkflowVersionEntity),
  ],
  exports: [CoreWorkflowAccessService],
})
export class CoreWorkflowAccessModule {}
