import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddComposeCampaignCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000040000-add-compose-campaign-command-menu-item.command';
import { BackfillEmailSuppressionAndListObjectsCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000030000-backfill-email-suppression-and-list-objects.command';
import { MigrateAiModelPreferencesCommand } from 'src/database/commands/upgrade-version-command/2-9/2-9-workspace-command-1799000000000-migrate-ai-model-preferences.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { TwentyStandardApplicationModule } from 'src/engine/workspace-manager/twenty-standard-application/twenty-standard-application.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyValuePairEntity]),
    WorkspaceIteratorModule,
    TwentyStandardApplicationModule,
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    MigrateAiModelPreferencesCommand,
    BackfillEmailSuppressionAndListObjectsCommand,
    AddComposeCampaignCommandMenuItemCommand,
  ],
})
export class V2_9_UpgradeVersionCommandModule {}
