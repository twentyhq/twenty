import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddWorkflowRunStopStatusesCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-add-workflow-run-stop-statuses.command';
import { MigrateAttachmentAuthorToCreatedByCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-migrate-attachment-author-to-created-by.command';
import { MigrateAttachmentTypeToFileCategoryCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-migrate-attachment-type-to-file-category.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, FieldMetadataEntity]),
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    MigrateAttachmentAuthorToCreatedByCommand,
    MigrateAttachmentTypeToFileCategoryCommand,
    AddWorkflowRunStopStatusesCommand,
  ],
  exports: [
    MigrateAttachmentAuthorToCreatedByCommand,
    MigrateAttachmentTypeToFileCategoryCommand,
    AddWorkflowRunStopStatusesCommand,
  ],
})
export class V1_10_UpgradeVersionCommandModule {}
