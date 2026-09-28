import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RenameCallRecordingTabsToTranscriptCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790583246061-rename-call-recording-tabs-to-transcript.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [RenameCallRecordingTabsToTranscriptCommand],
})
export class V2_44_UpgradeVersionCommandModule {}
