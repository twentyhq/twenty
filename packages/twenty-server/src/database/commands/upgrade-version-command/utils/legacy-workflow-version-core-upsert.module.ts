import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LegacyWorkflowVersionCoreUpsertService } from 'src/database/commands/upgrade-version-command/utils/legacy-workflow-version-core-upsert.service';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([WorkflowVersionEntity, WorkspaceEntity]),
    WorkspaceCacheModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    LegacyWorkflowVersionCoreUpsertService,
    provideWorkspaceScopedRepository(WorkflowVersionEntity),
  ],
  exports: [LegacyWorkflowVersionCoreUpsertService],
})
export class LegacyWorkflowVersionCoreUpsertModule {}
