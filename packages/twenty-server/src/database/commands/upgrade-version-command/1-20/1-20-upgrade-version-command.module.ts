import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-command-menu-items.command';
import { BackfillPageLayoutsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-page-layouts.command';
import { SeedCliApplicationRegistrationCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-seed-cli-application-registration.command';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { MigrateRichTextToTextCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-migrate-rich-text-to-text.command';
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
    ApplicationRegistrationModule,
    WorkspaceMigrationModule,
    FeatureFlagModule,
  ],
  providers: [
    BackfillCommandMenuItemsCommand,
    BackfillPageLayoutsCommand,
    SeedCliApplicationRegistrationCommand,
    MigrateRichTextToTextCommand,
  ],
  exports: [
    BackfillCommandMenuItemsCommand,
    BackfillPageLayoutsCommand,
    SeedCliApplicationRegistrationCommand,
    MigrateRichTextToTextCommand,
  ],
})
export class V1_20_UpgradeVersionCommandModule {}
