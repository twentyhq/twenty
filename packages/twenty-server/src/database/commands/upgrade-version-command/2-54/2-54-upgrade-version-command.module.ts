import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMergeWithRecordCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793204065461-add-merge-with-record-command-menu-item.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [AddMergeWithRecordCommandMenuItemCommand],
})
export class V2_54_UpgradeVersionCommandModule {}
