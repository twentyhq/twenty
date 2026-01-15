import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillWorkflowManualTriggersCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-backfill-workflow-manual-triggers.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    GlobalWorkspaceDataSourceModule,
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [BackfillWorkflowManualTriggersCommand],
  exports: [BackfillWorkflowManualTriggersCommand],
})
export class V1_17_UpgradeVersionCommandModule {}
