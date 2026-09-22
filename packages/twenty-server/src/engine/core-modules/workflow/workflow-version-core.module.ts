import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { FlatWorkflowVersionModule } from 'src/engine/metadata-modules/flat-workflow-version/flat-workflow-version.module';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceWorkflowAutomatedTriggerMapCacheService } from 'src/engine/core-modules/workflow/services/workspace-workflow-automated-trigger-map-cache.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowMetadataReadModule } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.module';
import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';

@Module({
  imports: [
    ApplicationModule,
    CacheStorageModule,
    WorkspaceMigrationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    RecordPositionModule,
    TypeOrmModule.forFeature([WorkflowVersionEntity, WorkspaceEntity]),
    WorkspaceCacheModule,
    FlatWorkflowVersionModule,
    WorkflowMetadataReadModule,
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
