import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddAiChatChannelAndRecordLinkCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795797261360-add-ai-chat-channel-and-record-link-command-menu-items.command';
import { RemoveTwentyStandardApplicationRoleCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795791151025-remove-twenty-standard-application-role.command';
import { ApplicationGrantRoleModule } from 'src/engine/core-modules/application/application-grant-role/application-grant-role.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationGrantRoleModule,
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RemoveTwentyStandardApplicationRoleCommand,
    AddAiChatChannelAndRecordLinkCommandMenuItemsCommand,
  ],
})
export class V2_66_UpgradeVersionCommandModule {}
