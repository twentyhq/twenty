import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddReplyToMessageParticipantRoleOptionCommand } from 'src/database/commands/upgrade-version-command/2-17/2-17-workspace-command-1801000001000-add-reply-to-message-participant-role-option.command';
import { AddWorkspaceMemberJobTitleFieldCommand } from 'src/database/commands/upgrade-version-command/2-17/2-17-workspace-command-1801000010000-add-workspace-member-job-title-field.command';
import { BackfillSystemUniqueIndexUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-17/2-17-workspace-command-1801000030000-backfill-system-unique-index-universal-identifier.command';
import { SyncCallRecordingNavigationCommandMenuItemAvailabilityExpressionCommand } from 'src/database/commands/upgrade-version-command/2-17/2-17-workspace-command-1801000000000-sync-call-recording-navigation-command-menu-item-availability-expression.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([IndexMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    SyncCallRecordingNavigationCommandMenuItemAvailabilityExpressionCommand,
    AddReplyToMessageParticipantRoleOptionCommand,
    AddWorkspaceMemberJobTitleFieldCommand,
    BackfillSystemUniqueIndexUniversalIdentifierCommand,
  ],
})
export class V2_17_UpgradeVersionCommandModule {}
