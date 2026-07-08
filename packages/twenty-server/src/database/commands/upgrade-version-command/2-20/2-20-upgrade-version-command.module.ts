import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillActorSourceEnumValuesCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783499671542-backfill-actor-source-enum-values.command';
import { BackfillWorkflowVersionToCoreCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783513009675-backfill-workflow-version-to-core.command';
import { AddMessageCampaignStatFieldsCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783525261000-add-message-campaign-stat-fields.command';
import { CreateMessageListViewCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783525261001-create-message-list-view.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
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
    TypeOrmModule.forFeature([WorkflowVersionEntity]),
  ],
  providers: [
    AddMessageCampaignStatFieldsCommand,
    CreateMessageListViewCommand,
    BackfillActorSourceEnumValuesCommand,
    BackfillWorkflowVersionToCoreCommand,
    provideWorkspaceScopedRepository(WorkflowVersionEntity),
  ],
})
export class V2_20_UpgradeVersionCommandModule {}
