import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMessageCampaignStatFieldsCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-workspace-command-1821000010000-add-message-campaign-stat-fields.command';
import { BackfillWorkspaceCustomApplicationRegistrationCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-workspace-command-1820000000000-backfill-workspace-custom-application-registration.command';
import { CreateMessageListViewCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-workspace-command-1821000012000-create-message-list-view.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { EmailingModule } from 'src/modules/emailing/emailing.module';

@Module({
  imports: [
    ApplicationModule,
    EmailingModule,
    TypeOrmModule.forFeature([WorkspaceEntity, ApplicationEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AddMessageCampaignStatFieldsCommand,
    BackfillWorkspaceCustomApplicationRegistrationCommand,
    CreateMessageListViewCommand,
  ],
})
export class V2_19_UpgradeVersionCommandModule {}
