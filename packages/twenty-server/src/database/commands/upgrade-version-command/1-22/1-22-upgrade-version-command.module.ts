import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillStandardSkillsCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-workspace-command-1780000002000-backfill-standard-skills.command';
import { FixMergeCommandSelectAllCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-workspace-command-1780000003000-fix-merge-command-select-all.command';
import { AddSendEmailRecordSelectionCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-22/1-22-workspace-command-1775500016000-add-send-email-record-selection-command-menu-items.command';
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
    AddSendEmailRecordSelectionCommandMenuItemsCommand,
    BackfillStandardSkillsCommand,
    FixMergeCommandSelectAllCommand,
  ],
})
export class V1_22_UpgradeVersionCommandModule {}
