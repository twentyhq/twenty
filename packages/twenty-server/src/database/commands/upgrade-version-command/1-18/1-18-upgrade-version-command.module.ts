import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigrateFavoritesToNavigationMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-favorites-to-navigation-menu-items.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
    ]),
    DataSourceModule,
    WorkspaceCacheStorageModule,
    WorkspaceCacheModule,
    ApplicationModule,
    UserWorkspaceModule,
    WorkspaceMigrationModule,
    FeatureFlagModule,
  ],
  providers: [MigrateFavoritesToNavigationMenuItemsCommand],
  exports: [MigrateFavoritesToNavigationMenuItemsCommand],
})
export class V1_18_UpgradeVersionCommandModule {}
