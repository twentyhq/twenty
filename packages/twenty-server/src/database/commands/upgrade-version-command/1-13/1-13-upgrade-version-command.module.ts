import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillPageLayoutUniversalIdentifiersCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-backfill-page-layout-universal-identifiers.command';
import { CleanEmptyStringNullInTextFieldsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-clean-empty-string-null-in-text-fields.command';
import { DeduplicateRoleTargetsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-deduplicate-role-targets.command';
import { MigrateStandardInvalidEntitiesCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-migrate-standard-invalid-entities.command';
import { MigrateTimelineActivityToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-migrate-timeline-activity-to-morph-relations.command';
import { RenameIndexNameCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-rename-index.command';
import { UpdateRoleTargetsUniqueConstraintMigrationCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-update-role-targets-unique-constraint-migration.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      IndexMetadataEntity,
      ViewEntity,
      ViewGroupEntity,
      FeatureFlagEntity,
      RoleTargetEntity,
      PageLayoutEntity,
      PageLayoutWidgetEntity,
      PageLayoutTabEntity,
      TimelineActivityWorkspaceEntity,
    ]),
    DataSourceModule,
    WorkspaceSchemaManagerModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataVersionModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    ApplicationModule,
  ],
  providers: [
    CleanEmptyStringNullInTextFieldsCommand,
    BackfillPageLayoutUniversalIdentifiersCommand,
    DeduplicateRoleTargetsCommand,
    RenameIndexNameCommand,
    MigrateStandardInvalidEntitiesCommand,
    UpdateRoleTargetsUniqueConstraintMigrationCommand,
    MigrateTimelineActivityToMorphRelationsCommand,
  ],
  exports: [
    CleanEmptyStringNullInTextFieldsCommand,
    BackfillPageLayoutUniversalIdentifiersCommand,
    DeduplicateRoleTargetsCommand,
    RenameIndexNameCommand,
    MigrateStandardInvalidEntitiesCommand,
    UpdateRoleTargetsUniqueConstraintMigrationCommand,
    MigrateTimelineActivityToMorphRelationsCommand,
  ],
})
export class V1_13_UpgradeVersionCommandModule {}
