import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMergeWithRecordCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793265618567-add-merge-with-record-command-menu-item.command';
import { UpdateCrmHygieneSkillMergeGuidanceCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793206127866-update-crm-hygiene-skill-merge-guidance.command';
import { RemoveMessageCampaignFlagCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793266150123-remove-message-campaign-flag.command';
import { AddCampaignsNavigationFolderCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793266210456-add-campaigns-navigation-folder.command';
import { MigrateLambdaDependencyLayersToV1Command } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793268360931-migrate-lambda-dependency-layers-to-v1.command';
import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { SdkClientModule } from 'src/engine/core-modules/sdk-client/sdk-client.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    ApplicationPackageModule,
    CacheLockModule,
    CoreEntityCacheModule,
    SdkClientModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AddMergeWithRecordCommandMenuItemCommand,
    UpdateCrmHygieneSkillMergeGuidanceCommand,
    RemoveMessageCampaignFlagCommand,
    AddCampaignsNavigationFolderCommand,
    MigrateLambdaDependencyLayersToV1Command,
  ],
})
export class V2_54_UpgradeVersionCommandModule {}
