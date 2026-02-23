import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillApplicationPackageFilesCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-backfill-application-package-files.command';
import { DeleteFileRecordsAndUpdateTableCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-delete-all-files-and-update-table.command';
import { FixMorphRelationFieldNamesCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-fix-morph-relation-field-names.command';
import { IdentifyWebhookMetadataCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-identify-webhook-metadata.command';
import { MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-make-webhook-universal-identifier-and-application-id-not-nullable-migration.command';
import { MigrateAttachmentToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-attachment-to-morph-relations.command';
import { MigrateDateTimeIsFilterValuesCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-date-time-is-filter-values.command';
import { MigrateNoteTargetToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-note-target-to-morph-relations.command';
import { MigrateSendEmailRecipientsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-send-email-recipients.command';
import { MigrateTaskTargetToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-task-target-to-morph-relations.command';
import { SeedWorkflowV1_16Command } from 'src/database/commands/upgrade-version-command/1-17/1-17-seed-workflow-v1-16.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      FeatureFlagEntity,
      AttachmentWorkspaceEntity,
      WebhookEntity,
      NoteTargetWorkspaceEntity,
      TaskTargetWorkspaceEntity,
      FileEntity,
      ViewFilterEntity,
      LogicFunctionEntity,
    ]),
    DataSourceModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataVersionModule,
    FeatureFlagModule,
    FileStorageModule.forRoot(),
    WorkspaceCacheModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    ApplicationModule,
    UserWorkspaceModule,
    WorkspaceMigrationModule,
    RecordPositionModule,
    GlobalWorkspaceDataSourceModule,
  ],
  providers: [
    FixMorphRelationFieldNamesCommand,
    MigrateAttachmentToMorphRelationsCommand,
    MigrateNoteTargetToMorphRelationsCommand,
    MigrateTaskTargetToMorphRelationsCommand,
    IdentifyWebhookMetadataCommand,
    MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    DeleteFileRecordsAndUpdateTableCommand,
    MigrateSendEmailRecipientsCommand,
    MigrateDateTimeIsFilterValuesCommand,
    SeedWorkflowV1_16Command,
    BackfillApplicationPackageFilesCommand,
  ],
  exports: [
    FixMorphRelationFieldNamesCommand,
    MigrateAttachmentToMorphRelationsCommand,
    MigrateNoteTargetToMorphRelationsCommand,
    MigrateTaskTargetToMorphRelationsCommand,
    IdentifyWebhookMetadataCommand,
    MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MigrateSendEmailRecipientsCommand,
    MigrateDateTimeIsFilterValuesCommand,
    DeleteFileRecordsAndUpdateTableCommand,
    SeedWorkflowV1_16Command,
    BackfillApplicationPackageFilesCommand,
  ],
})
export class V1_17_UpgradeVersionCommandModule {}
