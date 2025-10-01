import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillWorkflowManualTriggerAvailabilityCommand } from 'src/database/commands/upgrade-version-command/1-7/1-7-backfill-workflow-manual-trigger-availability.command';
import { CleanAttachmentTypeValuesCommand } from 'src/database/commands/upgrade-version-command/1-7/1-7-clean-attachment-type-values.command';
import { MigrateAttachmentAuthorToCreatedByCommand } from 'src/database/commands/upgrade-version-command/1-7/1-7-migrate-attachment-author-to-created-by.command';
import { MigrateAttachmentTypeToSelectCommand } from 'src/database/commands/upgrade-version-command/1-7/1-7-migrate-attachment-type-to-select.command';
import { RegeneratePersonSearchVectorWithPhonesCommand } from 'src/database/commands/upgrade-version-command/1-7/1-7-regenerate-person-search-vector-with-phones.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      FieldMetadataEntity,
      ObjectMetadataEntity,
    ]),
    WorkspaceDataSourceModule,
  ],
  providers: [
    RegeneratePersonSearchVectorWithPhonesCommand,
    CleanAttachmentTypeValuesCommand,
    MigrateAttachmentTypeToSelectCommand,
    MigrateAttachmentAuthorToCreatedByCommand,
    BackfillWorkflowManualTriggerAvailabilityCommand,
  ],
  exports: [
    RegeneratePersonSearchVectorWithPhonesCommand,
    CleanAttachmentTypeValuesCommand,
    MigrateAttachmentTypeToSelectCommand,
    MigrateAttachmentAuthorToCreatedByCommand,
    BackfillWorkflowManualTriggerAvailabilityCommand,
  ],
})
export class V1_7_UpgradeVersionCommandModule {}
