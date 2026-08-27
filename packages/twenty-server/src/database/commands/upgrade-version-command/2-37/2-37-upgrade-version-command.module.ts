import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillMessageCalendarTargetsCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787832413051-backfill-message-calendar-targets.command';
import { EnableEditLayoutAcrossAppCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787837054189-enable-edit-layout-across-app.command';
import { SyncMessageCalendarTargetMetadataCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787832412051-sync-message-calendar-target-metadata.command';
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
    EnableEditLayoutAcrossAppCommand,
  ],
})
export class V2_37_UpgradeVersionCommandModule {}
