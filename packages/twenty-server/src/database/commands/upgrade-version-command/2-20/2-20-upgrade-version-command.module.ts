import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillActorSourceEnumValuesCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783499671542-backfill-actor-source-enum-values.command';
import { AddMessageCampaignStatFieldsCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783525261000-add-message-campaign-stat-fields.command';
import { CreateMessageListViewCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783525261001-create-message-list-view.command';
import { BackfillWorkflowVersionToCoreCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783526282685-backfill-workflow-version-to-core.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

import { ReconcileSearchVectorGinIndexUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1825000001000-reconcile-search-vector-gin-index-universal-identifier.command';
import { ReconcileSearchFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1825000002000-reconcile-search-field-metadata.command';
import { RebuildInstalledAppSearchVectorsCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1825000003000-rebuild-installed-app-search-vectors.command';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceIteratorModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
    WorkflowVersionCoreModule,
    TypeOrmModule.forFeature([IndexMetadataEntity, SearchFieldMetadataEntity]),
    WorkspaceIteratorModule,
    WorkspaceCacheModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
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
