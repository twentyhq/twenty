import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillRecordPageLayoutsCommand } from 'src/database/commands/upgrade-version-command/1-23/1-23-workspace-command-1780000001500-backfill-record-page-layouts.command';
import { UpdateGlobalObjectContextCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-23/1-23-workspace-command-1780000005000-update-global-object-context-command-menu-items.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    BackfillRecordPageLayoutsCommand,
    UpdateGlobalObjectContextCommandMenuItemsCommand,
  ],
})
export class V1_23_UpgradeVersionCommandModule {}
