import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddWorkflowRunStopStatusesCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-add-workflow-run-stop-statuses.command';
import { CleanOrphanedKanbanAggregateOperationFieldMetadataIdCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-clean-orphaned-kanban-aggregate-operation-field-metadata-id.command';
import { CreateViewKanbanFieldMetadataIdForeignKeyMigrationCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-create-view-kanban-field-metadata-id-foreign-key-migration.command';
import { MigrateAttachmentAuthorToCreatedByCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-migrate-attachment-author-to-created-by.command';
import { MigrateAttachmentTypeToFileCategoryCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-migrate-attachment-type-to-file-category.command';
import { MigrateChannelPartialFullSyncStagesCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-migrate-channel-partial-full-sync-stages.command';
import { RegenerateSearchVectorsCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-regenerate-search-vectors.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      IndexMetadataEntity,
      ViewEntity,
    ]),
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    MigrateChannelPartialFullSyncStagesCommand,
    MigrateAttachmentAuthorToCreatedByCommand,
    MigrateAttachmentTypeToFileCategoryCommand,
    RegenerateSearchVectorsCommand,
    AddWorkflowRunStopStatusesCommand,
    CleanOrphanedKanbanAggregateOperationFieldMetadataIdCommand,
    CreateViewKanbanFieldMetadataIdForeignKeyMigrationCommand,
  ],
  exports: [
    MigrateAttachmentAuthorToCreatedByCommand,
    MigrateAttachmentTypeToFileCategoryCommand,
    RegenerateSearchVectorsCommand,
    AddWorkflowRunStopStatusesCommand,
    CleanOrphanedKanbanAggregateOperationFieldMetadataIdCommand,
    MigrateChannelPartialFullSyncStagesCommand,
    CreateViewKanbanFieldMetadataIdForeignKeyMigrationCommand,
  ],
})
export class V1_10_UpgradeVersionCommandModule {}
