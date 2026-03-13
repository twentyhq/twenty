import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddFolderImportToMessageFolderPendingSyncActionCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-add-folder-import-to-message-folder-pending-sync-action.command';
import { AddMissingSystemFieldsToStandardObjectsCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-add-missing-system-fields-to-standard-objects.command';
import { BackfillMessageChannelMessageAssociationMessageFolderCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-backfill-message-channel-message-association-message-folder.command';
import { BackfillMissingStandardViewsCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-backfill-missing-standard-views.command';
import { BackfillSystemFieldsIsSystemCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-backfill-system-fields-is-system.command';
import { FixInvalidStandardUniversalIdentifiersCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-fix-invalid-standard-universal-identifiers.command';
import { SeedServerIdCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-seed-server-id.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    WorkspaceCacheModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationRunnerModule,
    ApplicationModule,
    WorkspaceMigrationModule,
    FeatureFlagModule,
  ],
  providers: [
    BackfillSystemFieldsIsSystemCommand,
    AddMissingSystemFieldsToStandardObjectsCommand,
    AddFolderImportToMessageFolderPendingSyncActionCommand,
    BackfillMessageChannelMessageAssociationMessageFolderCommand,
    BackfillMissingStandardViewsCommand,
    FixInvalidStandardUniversalIdentifiersCommand,
    SeedServerIdCommand,
  ],
  exports: [
    BackfillSystemFieldsIsSystemCommand,
    AddMissingSystemFieldsToStandardObjectsCommand,
    AddFolderImportToMessageFolderPendingSyncActionCommand,
    BackfillMessageChannelMessageAssociationMessageFolderCommand,
    BackfillMissingStandardViewsCommand,
    FixInvalidStandardUniversalIdentifiersCommand,
    SeedServerIdCommand,
  ],
})
export class V1_19_UpgradeVersionCommandModule {}
