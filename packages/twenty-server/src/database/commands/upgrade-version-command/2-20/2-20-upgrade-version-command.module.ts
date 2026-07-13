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
import { MigratePersonAvatarUrlToAvatarFileCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-workspace-command-1783541976846-migrate-person-avatar-url-to-avatar-file.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FilesFieldModule } from 'src/engine/core-modules/file/files-field/files-field.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([IndexMetadataEntity, SearchFieldMetadataEntity]),
    WorkflowVersionCoreModule,
    FilesFieldModule,
    SecureHttpClientModule,
    GlobalWorkspaceDataSourceModule,
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
