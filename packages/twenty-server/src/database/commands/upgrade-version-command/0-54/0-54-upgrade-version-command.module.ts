import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CleanNotFoundFilesCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-clean-not-found-files.command';
import { FixCreatedByDefaultValueCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-created-by-default-value.command';
import { FixStandardSelectFieldsPositionCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-fix-standard-select-fields-position.command';
import { LowercaseUserAndInvitationEmailsCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-lowercase-user-and-invitation-emails.command';
import { MigrateDefaultAvatarUrlToUserWorkspaceCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-migrate-default-avatar-url-to-user-workspace.command';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Workspace, AppToken, User, UserWorkspace],
      'core',
    ),
    TypeOrmModule.forFeature(
      [FieldMetadataEntity, ObjectMetadataEntity],
      'core',
    ),
    WorkspaceDataSourceModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMetadataVersionModule,
    FileModule,
    FileStorageModule,
  ],
  providers: [
    FixStandardSelectFieldsPositionCommand,
    FixCreatedByDefaultValueCommand,
    CleanNotFoundFilesCommand,
    LowercaseUserAndInvitationEmailsCommand,
    MigrateDefaultAvatarUrlToUserWorkspaceCommand,
  ],
  exports: [
    FixStandardSelectFieldsPositionCommand,
    FixCreatedByDefaultValueCommand,
    CleanNotFoundFilesCommand,
    LowercaseUserAndInvitationEmailsCommand,
    MigrateDefaultAvatarUrlToUserWorkspaceCommand,
  ],
})
export class V0_54_UpgradeVersionCommandModule {}
