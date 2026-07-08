import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMessageCampaignStatFieldsCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783083423000-add-message-campaign-stat-fields.command';
import { CreateMessageListViewCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783083423001-create-message-list-view.command';
import { BackfillActorSourceEnumValuesCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783499671542-backfill-actor-source-enum-values.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceIteratorModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    AddMessageCampaignStatFieldsCommand,
    CreateMessageListViewCommand,
    BackfillActorSourceEnumValuesCommand,
  ],
})
export class V2_20_UpgradeVersionCommandModule {}
