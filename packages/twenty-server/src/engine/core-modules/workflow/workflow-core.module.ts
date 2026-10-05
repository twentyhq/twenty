import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { FlatWorkflowModule } from 'src/engine/metadata-modules/flat-workflow/flat-workflow.module';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceMigrationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TypeOrmModule.forFeature([WorkflowEntity, WorkspaceEntity]),
    WorkspaceCacheModule,
    FlatWorkflowModule,
  ],
  providers: [
    WorkflowCoreSyncService,
    provideWorkspaceScopedRepository(WorkflowEntity),
  ],
  exports: [TypeOrmModule, WorkflowCoreSyncService],
})
export class WorkflowCoreModule {}
