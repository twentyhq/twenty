import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UnpinNewAiChatCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791405719721-unpin-new-ai-chat.command';
import { UnfollowChatsMembersOnlyReadCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791728623417-unfollow-chats-members-only-read.command';
import { DropLegacyChatColumnsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791730401449-drop-legacy-chat-columns.command';
import { SyncCampaignEngagementFieldsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791789521847-sync-campaign-engagement-fields.command';
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
    UnpinNewAiChatCommand,
    UnfollowChatsMembersOnlyReadCommand,
    DropLegacyChatColumnsCommand,
    SyncCampaignEngagementFieldsCommand,
  ],
})
export class V2_47_UpgradeVersionCommandModule {}
