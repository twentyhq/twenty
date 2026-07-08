import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillActorSourceEnumValuesCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783499671542-backfill-actor-source-enum-values.command';
import { BackfillCallRecordingApplicationIdCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783528000000-backfill-call-recording-application-id.command';
import { BackfillWorkflowVersionToCoreCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783526282685-backfill-workflow-version-to-core.command';
import { AddMessageCampaignStatFieldsCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783525261000-add-message-campaign-stat-fields.command';
import { CreateMessageListViewCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783525261001-create-message-list-view.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
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
    WorkflowVersionCoreModule,
  ],
  providers: [
    AddMessageCampaignStatFieldsCommand,
    CreateMessageListViewCommand,
    BackfillActorSourceEnumValuesCommand,
    BackfillWorkflowVersionToCoreCommand,
    BackfillCallRecordingApplicationIdCommand,
  ],
})
export class V2_20_UpgradeVersionCommandModule {}
