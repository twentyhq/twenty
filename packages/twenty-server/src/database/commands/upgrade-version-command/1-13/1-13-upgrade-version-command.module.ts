import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillViewMainGroupByFieldMetadataIdCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-backfill-view-main-group-by-field-metadata-id.command';
import { CleanEmptyStringNullInTextFieldsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-clean-empty-string-null-in-text-fields.command';
import { DeduplicateRoleTargetsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-deduplicate-role-targets.command';
import { UpdateRoleTargetsUniqueConstraintMigrationCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-update-role-targets-unique-constraint-migration.command';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      ViewEntity,
      ViewGroupEntity,
      FeatureFlagEntity,
      RoleTargetEntity,
    ]),
    DataSourceModule,
  ],
  providers: [
    CleanEmptyStringNullInTextFieldsCommand,
    BackfillViewMainGroupByFieldMetadataIdCommand,
    DeduplicateRoleTargetsCommand,
    UpdateRoleTargetsUniqueConstraintMigrationCommand,
  ],
  exports: [
    CleanEmptyStringNullInTextFieldsCommand,
    BackfillViewMainGroupByFieldMetadataIdCommand,
    DeduplicateRoleTargetsCommand,
    UpdateRoleTargetsUniqueConstraintMigrationCommand,
  ],
})
export class V1_13_UpgradeVersionCommandModule {}
