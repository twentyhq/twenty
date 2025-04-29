import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillWorkflowNextStepIdsCommand } from 'src/database/commands/upgrade-version-command/0-52/0-52-backfill-workflow-next-step-ids.command';
import { MigrateRelationsToFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/0-52/0-52-migrate-relations-to-field-metadata.command';
import { UpgradeDateAndDateTimeFieldsSettingsJsonCommand } from 'src/database/commands/upgrade-version-command/0-52/0-52-upgrade-settings-field';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
    WorkspaceDataSourceModule,
  ],
  providers: [
    BackfillWorkflowNextStepIdsCommand,
    UpgradeDateAndDateTimeFieldsSettingsJsonCommand,
    MigrateRelationsToFieldMetadataCommand,
  ],
  exports: [
    BackfillWorkflowNextStepIdsCommand,
    UpgradeDateAndDateTimeFieldsSettingsJsonCommand,
    MigrateRelationsToFieldMetadataCommand,
  ],
})
export class V0_52_UpgradeVersionCommandModule {}
