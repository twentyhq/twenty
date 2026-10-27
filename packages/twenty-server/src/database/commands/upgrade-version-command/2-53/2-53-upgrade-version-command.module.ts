import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncWorkspaceMemberRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793117418686-sync-workspace-member-record-page.command';
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
  providers: [SyncWorkspaceMemberRecordPageCommand],
})
export class V2_53_UpgradeVersionCommandModule {}
