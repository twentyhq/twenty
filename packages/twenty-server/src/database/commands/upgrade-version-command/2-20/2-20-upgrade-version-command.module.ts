import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMessageCampaignStatFieldsCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1825000010000-add-message-campaign-stat-fields.command';
import { CreateMessageListViewCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1825000012000-create-message-list-view.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { EmailingModule } from 'src/modules/emailing/emailing.module';

@Module({
  imports: [
    ApplicationModule,
    EmailingModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AddMessageCampaignStatFieldsCommand,
    CreateMessageListViewCommand,
  ],
})
export class V2_20_UpgradeVersionCommandModule {}
