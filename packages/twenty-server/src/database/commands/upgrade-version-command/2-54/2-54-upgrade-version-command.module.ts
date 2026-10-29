import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMergeWithRecordCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793265618567-add-merge-with-record-command-menu-item.command';
import { UpdateCrmHygieneSkillMergeGuidanceCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793206127866-update-crm-hygiene-skill-merge-guidance.command';
import { RemoveMessageCampaignFlagCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793266150123-remove-message-campaign-flag.command';
import { AddCampaignsNavigationFolderCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793266210456-add-campaigns-navigation-folder.command';
import { UpdateDataManipulationSkillImportCheckCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793277571540-update-data-manipulation-skill-import-check.command';
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
    AddMergeWithRecordCommandMenuItemCommand,
    UpdateCrmHygieneSkillMergeGuidanceCommand,
    RemoveMessageCampaignFlagCommand,
    AddCampaignsNavigationFolderCommand,
    UpdateDataManipulationSkillImportCheckCommand,
  ],
})
export class V2_54_UpgradeVersionCommandModule {}
