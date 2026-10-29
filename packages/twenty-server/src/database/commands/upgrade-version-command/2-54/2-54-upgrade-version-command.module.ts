import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddChatConversationTypeCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793280040522-add-chat-conversation-type.command';
import { AddMergeWithRecordCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793265618567-add-merge-with-record-command-menu-item.command';
import { UpdateCrmHygieneSkillMergeGuidanceCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793206127866-update-crm-hygiene-skill-merge-guidance.command';
import { RemoveMessageCampaignFlagCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793266150123-remove-message-campaign-flag.command';
import { AddCampaignsNavigationFolderCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793266210456-add-campaigns-navigation-folder.command';
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
    AddChatConversationTypeCommand,
    AddMergeWithRecordCommandMenuItemCommand,
    UpdateCrmHygieneSkillMergeGuidanceCommand,
    RemoveMessageCampaignFlagCommand,
    AddCampaignsNavigationFolderCommand,
  ],
})
export class V2_54_UpgradeVersionCommandModule {}
