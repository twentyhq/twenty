import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillMessageListMembersJunctionTargetCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1784567000000-backfill-message-list-members-junction-target.command';
import { AddMessageCampaignComposerTabCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785229940000-add-message-campaign-composer-tab.command';
import { ConfigureMessageCampaignCommandMenuCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785229960000-configure-message-campaign-command-menu.command';
import { AddMessageCampaignNameFieldCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785229970000-add-message-campaign-name-field.command';
import { RemoveMessageCampaignNavigationMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785332550000-remove-message-campaign-navigation-menu-item.command';
import { AlignMessageCampaignViewFieldPositionsCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785332560000-align-message-campaign-view-field-positions.command';
import { MakeMessageCampaignUserFacingCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785430000000-make-message-campaign-user-facing.command';
import { MakeMessageListUserFacingCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785430000001-make-message-list-user-facing.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity, ObjectMetadataEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    BackfillMessageListMembersJunctionTargetCommand,
    AddMessageCampaignComposerTabCommand,
    ConfigureMessageCampaignCommandMenuCommand,
    AddMessageCampaignNameFieldCommand,
    RemoveMessageCampaignNavigationMenuItemCommand,
    AlignMessageCampaignViewFieldPositionsCommand,
    MakeMessageCampaignUserFacingCommand,
    MakeMessageListUserFacingCommand,
  ],
})
export class V2_25_UpgradeVersionCommandModule {}
