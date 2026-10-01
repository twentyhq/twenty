import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddRecordShareNoneAccessLevelCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790849715187-add-record-share-none-access-level.command';
import { RestrictExportRecordsToIndexPageCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790837443029-restrict-export-records-to-index-page.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RestrictExportRecordsToIndexPageCommand,
    AddRecordShareNoneAccessLevelCommand,
  ],
})
export class V2_45_UpgradeVersionCommandModule {}
