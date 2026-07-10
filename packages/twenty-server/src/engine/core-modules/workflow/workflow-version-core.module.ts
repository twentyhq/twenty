import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceWorkflowAutomatedTriggerMapCacheService } from 'src/engine/core-modules/workflow/services/workspace-workflow-automated-trigger-map-cache.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowVersionEntity, WorkspaceEntity]),
    WorkspaceCacheModule,
  ],
  providers: [
    WorkspaceWorkflowAutomatedTriggerMapCacheService,
    WorkflowVersionCoreSyncService,
    provideWorkspaceScopedRepository(WorkflowVersionEntity),
  ],
  exports: [
    TypeOrmModule,
    WorkspaceWorkflowAutomatedTriggerMapCacheService,
    WorkflowVersionCoreSyncService,
  ],
})
export class WorkflowVersionCoreModule {}
