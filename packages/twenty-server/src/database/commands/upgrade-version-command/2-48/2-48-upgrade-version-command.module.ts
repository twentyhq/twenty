import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CountMessageListMembersCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791977057418-count-message-list-members.command';
import { RemoveCampaignListStatColumnsCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791979361903-remove-campaign-list-stat-columns.command';
import { AddCampaignListViewCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791979361904-add-campaign-list-view.command';
import { StripDerivedRecordFilterPropertiesCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791986817506-strip-derived-record-filter-properties.command';
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
    CountMessageListMembersCommand,
    RemoveCampaignListStatColumnsCommand,
    AddCampaignListViewCommand,
    StripDerivedRecordFilterPropertiesCommand,
  ],
})
export class V2_48_UpgradeVersionCommandModule {}
