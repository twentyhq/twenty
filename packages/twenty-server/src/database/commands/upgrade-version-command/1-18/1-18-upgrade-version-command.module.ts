import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillFileSizeAndMimeTypeCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-backfill-file-size-and-mime-type.command';
import { BackfillMessageChannelThrottleRetryAfterCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-backfill-message-channel-throttle-retry-after.command';
import { BackfillStandardViewsAndFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-backfill-standard-views-and-field-metadata.command';
import { MigrateActivityRichTextAttachmentFileIdsCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-activity-rich-text-attachment-file-ids.command';
import { MigrateAttachmentFilesCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-attachment-files.command';
import { MigrateFavoritesToNavigationMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-favorites-to-navigation-menu-items.command';
import { MigratePersonAvatarFilesCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-person-avatar-files.command';
import { MigrateWorkflowSendEmailAttachmentsCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-workflow-send-email-attachments.command';
import { MigrateWorkspacePicturesCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-workspace-pictures.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      FeatureFlagEntity,
      PersonWorkspaceEntity,
      FileEntity,
      AttachmentWorkspaceEntity,
      WorkspaceMemberWorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
    ]),
    DataSourceModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataVersionModule,
    FieldMetadataModule,
    ApplicationModule,
    FileModule,
    UserWorkspaceModule,
    WorkspaceMigrationModule,
    SecureHttpClientModule,
  ],
  providers: [
    MigratePersonAvatarFilesCommand,
    MigrateFavoritesToNavigationMenuItemsCommand,
    MigrateAttachmentFilesCommand,
    BackfillFileSizeAndMimeTypeCommand,
    MigrateWorkspacePicturesCommand,
    MigrateActivityRichTextAttachmentFileIdsCommand,
    BackfillMessageChannelThrottleRetryAfterCommand,
    BackfillStandardViewsAndFieldMetadataCommand,
    MigrateWorkflowSendEmailAttachmentsCommand,
  ],
  exports: [
    MigratePersonAvatarFilesCommand,
    MigrateFavoritesToNavigationMenuItemsCommand,
    MigrateAttachmentFilesCommand,
    MigrateActivityRichTextAttachmentFileIdsCommand,
    BackfillMessageChannelThrottleRetryAfterCommand,
    BackfillStandardViewsAndFieldMetadataCommand,
    MigrateWorkspacePicturesCommand,
    MigrateWorkflowSendEmailAttachmentsCommand,
    BackfillFileSizeAndMimeTypeCommand,
  ],
})
export class V1_18_UpgradeVersionCommandModule {}
