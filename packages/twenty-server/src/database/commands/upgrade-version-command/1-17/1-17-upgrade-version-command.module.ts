import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigrateAttachmentToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-attachment-to-morph-relations.command';
import { MigrateFavoritesToNavigationMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-favorites-to-navigation-menu-items.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      FeatureFlagEntity,
      AttachmentWorkspaceEntity,
    ]),
    DataSourceModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataVersionModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    ApplicationModule,
    UserWorkspaceModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    MigrateAttachmentToMorphRelationsCommand,
    MigrateFavoritesToNavigationMenuItemsCommand,
  ],
  exports: [
    MigrateAttachmentToMorphRelationsCommand,
    MigrateFavoritesToNavigationMenuItemsCommand,
  ],
})
export class V1_17_UpgradeVersionCommandModule {}
