import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowEventModule } from 'src/engine/core-modules/workflow/core-workflow-event.module';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowEntity, WorkspaceEntity]),
    WorkspaceCacheModule,
    CoreWorkflowEventModule,
  ],
  providers: [
    WorkflowCoreSyncService,
    provideWorkspaceScopedRepository(WorkflowEntity),
  ],
  exports: [TypeOrmModule, WorkflowCoreSyncService, CoreWorkflowEventModule],
})
export class WorkflowCoreModule {}
