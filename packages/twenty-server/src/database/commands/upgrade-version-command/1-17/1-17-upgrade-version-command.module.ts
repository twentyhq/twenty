import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdentifyWebhookMetadataCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-identify-webhook-metadata.command';
import { MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-make-webhook-universal-identifier-and-application-id-not-nullable-migration.command';
import { MigrateAttachmentToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-migrate-attachment-to-morph-relations.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
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
    ]),
    DataSourceModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataVersionModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    ApplicationModule,
  ],
  providers: [
    MigrateAttachmentToMorphRelationsCommand,
    IdentifyWebhookMetadataCommand,
    MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
  ],
  exports: [
    MigrateAttachmentToMorphRelationsCommand,
    IdentifyWebhookMetadataCommand,
    MakeWebhookUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
  ],
})
export class V1_17_UpgradeVersionCommandModule {}
