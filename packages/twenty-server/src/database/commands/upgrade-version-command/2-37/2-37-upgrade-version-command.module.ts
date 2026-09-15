import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillMessageCalendarTargetsCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787832413051-backfill-message-calendar-targets.command';
import { SyncMessageCalendarTargetMetadataCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787832412051-sync-message-calendar-target-metadata.command';
import { RestoreSettingsNavigationCommandMenuItemLabelsCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787840804000-restore-settings-navigation-command-menu-item-labels.command';
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
  providers: [
    SyncMessageCalendarTargetMetadataCommand,
    BackfillMessageCalendarTargetsCommand,
    RestoreSettingsNavigationCommandMenuItemLabelsCommand,
  ],
})
export class V2_37_UpgradeVersionCommandModule {}
