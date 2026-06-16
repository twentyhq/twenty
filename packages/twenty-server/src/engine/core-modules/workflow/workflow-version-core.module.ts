import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkspaceWorkflowAutomatedTriggerMapCacheService } from 'src/engine/core-modules/workflow/services/workspace-workflow-automated-trigger-map-cache.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowVersionEntity])],
  providers: [
    WorkspaceWorkflowAutomatedTriggerMapCacheService,
    provideWorkspaceScopedRepository(WorkflowVersionEntity),
  ],
  exports: [
    TypeOrmModule,
    WorkspaceWorkflowAutomatedTriggerMapCacheService,
    getWorkspaceScopedRepositoryToken(WorkflowVersionEntity),
  ],
})
export class WorkflowVersionCoreModule {}
