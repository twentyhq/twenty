import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillFileSizeAndMimeTypeCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-backfill-file-size-and-mime-type.command';
import { BackfillMessageChannelThrottleRetryAfterCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-backfill-message-channel-throttle-retry-after.command';
import { MigrateActivityRichTextAttachmentFileIdsCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-activity-rich-text-attachment-file-ids.command';
import { MigrateAttachmentFilesCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-attachment-files.command';
import { MigratePersonAvatarFilesCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-person-avatar-files.command';
import { MigrateWorkspacePicturesCommand } from 'src/database/commands/upgrade-version-command/1-18/1-18-migrate-workspace-pictures.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
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
    ]),
    DataSourceModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
    ApplicationModule,
    FileModule,
  ],
  providers: [
    MigratePersonAvatarFilesCommand,
    MigrateAttachmentFilesCommand,
    BackfillFileSizeAndMimeTypeCommand,
    MigrateWorkspacePicturesCommand,
    MigrateActivityRichTextAttachmentFileIdsCommand,
    BackfillMessageChannelThrottleRetryAfterCommand,
  ],
  exports: [
    MigratePersonAvatarFilesCommand,
    MigrateAttachmentFilesCommand,
    MigrateActivityRichTextAttachmentFileIdsCommand,
    MigrateWorkspacePicturesCommand,
    BackfillFileSizeAndMimeTypeCommand,
  ],
})
export class V1_18_UpgradeVersionCommandModule {}
