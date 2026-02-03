import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeleteFileRecordsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-delete-all-files.command';
import { IdentifyWebhookMetadataCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-identify-webhook-metadata.command';
import { MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-make-webhook-universal-identifier-and-application-id-not-nullable-migration.command';
import { MigrateAttachmentToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-attachment-to-morph-relations.command';
import { MigrateSendEmailRecipientsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-send-email-recipients.command';
import { MigrateWorkflowCodeStepsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-workflow-code-steps.command';
import { SeedWorkflowV1_16Command } from 'src/database/commands/upgrade-version-command/1-17/1-17-seed-workflow-v1-16.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { CoreLogicFunctionLayerModule } from 'src/engine/core-modules/logic-function/logic-function-layer/logic-function-layer.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      FeatureFlagEntity,
      AttachmentWorkspaceEntity,
      WebhookEntity,
      FileEntity,
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
    CoreLogicFunctionLayerModule,
    LogicFunctionModule,
    RecordPositionModule,
    GlobalWorkspaceDataSourceModule,
  ],
  providers: [
    MigrateAttachmentToMorphRelationsCommand,
    IdentifyWebhookMetadataCommand,
    MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    DeleteFileRecordsCommand,
    MigrateSendEmailRecipientsCommand,
    MigrateWorkflowCodeStepsCommand,
    SeedWorkflowV1_16Command,
  ],
  exports: [
    MigrateAttachmentToMorphRelationsCommand,
    IdentifyWebhookMetadataCommand,
    MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    DeleteFileRecordsCommand,
    MigrateSendEmailRecipientsCommand,
    MigrateWorkflowCodeStepsCommand,
    SeedWorkflowV1_16Command,
  ],
})
export class V1_17_UpgradeVersionCommandModule {}
