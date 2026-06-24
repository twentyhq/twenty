import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillSearchFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1799100000000-backfill-search-field-metadata.command';
import { RenameCallRecordingFailedStatusCommand } from 'src/database/commands/upgrade-version-command/2-16/2-16-workspace-command-1799100001000-rename-call-recording-failed-status.command';
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
    BackfillSearchFieldMetadataCommand,
    RenameCallRecordingFailedStatusCommand,
  ],
})
export class V2_16_UpgradeVersionCommandModule {}
