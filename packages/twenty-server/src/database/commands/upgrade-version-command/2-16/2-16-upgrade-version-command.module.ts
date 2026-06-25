import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMessageIsDraftFieldCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1799100002000-add-message-is-draft-field.command';
import { BackfillSearchFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1799100000000-backfill-search-field-metadata.command';
import { SyncCallRecordingStatusCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1799100001000-sync-call-recording-status.command';
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
    AddMessageIsDraftFieldCommand,
    BackfillSearchFieldMetadataCommand,
    SyncCallRecordingStatusCommand,
  ],
})
export class V2_16_UpgradeVersionCommandModule {}
