import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillActorSourceEnumValuesCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783499671542-backfill-actor-source-enum-values.command';
import { AddMessageCampaignStatFieldsCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783525261000-add-message-campaign-stat-fields.command';
import { CreateMessageListViewCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783525261001-create-message-list-view.command';
import { BackfillWorkflowVersionToCoreCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783526282685-backfill-workflow-version-to-core.command';
import { ReconcileSearchVectorGinIndexUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783529458169-reconcile-search-vector-gin-index-universal-identifier.command';
import { ReconcileSearchFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783529458170-reconcile-search-field-metadata.command';
import { RebuildInstalledAppSearchVectorsCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783529458171-rebuild-installed-app-search-vectors.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([IndexMetadataEntity, SearchFieldMetadataEntity]),
    WorkflowVersionCoreModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    AddMessageCampaignStatFieldsCommand,
    CreateMessageListViewCommand,
    BackfillActorSourceEnumValuesCommand,
    BackfillWorkflowVersionToCoreCommand,
    ReconcileSearchVectorGinIndexUniversalIdentifierCommand,
    ReconcileSearchFieldMetadataCommand,
    RebuildInstalledAppSearchVectorsCommand,
  ],
})
export class V2_20_UpgradeVersionCommandModule {}
