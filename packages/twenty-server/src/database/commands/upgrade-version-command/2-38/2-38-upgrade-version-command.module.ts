import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SurfaceTargetRelationsOnRecordPagesCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787909425119-surface-target-relations-on-record-pages.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [SurfaceTargetRelationsOnRecordPagesCommand],
})
export class V2_38_UpgradeVersionCommandModule {}
