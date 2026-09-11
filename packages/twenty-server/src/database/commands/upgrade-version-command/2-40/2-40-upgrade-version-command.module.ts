import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncRecordShareObjectCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788794677636-sync-record-share-object.command';
import { AddMessageCampaignScheduledAtCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788957151735-add-message-campaign-scheduled-at.command';
import { BackfillCoreWorkflowIdOnWorkflowVersionsCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1788960408162-backfill-core-workflow-id-on-workflow-versions.command';
import { MakeCallRecordingPrivateCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789100000000-make-call-recording-private.command';
import { BackfillCallRecordingSharesCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789100000001-backfill-call-recording-shares.command';
import { MakeStandardChildObjectsInheritedCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789100100001-make-standard-child-objects-inherited.command';
import { BackfillChannelRecordSharesCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789100200000-backfill-channel-record-shares.command';
import { MakeMessagingAndCalendarPrivateCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789100300000-make-messaging-and-calendar-private.command';
import { AddShareRecordCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789100500000-add-share-record-command-menu-item.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { RecordShareModule } from 'src/engine/record-share/record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { CalendarCommonModule } from 'src/modules/calendar/common/calendar-common.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';

@Module({
  imports: [
    ApplicationModule,
    CalendarCommonModule,
    MessagingCommonModule,
    RecordShareModule,
    TypeOrmModule.forFeature([MessageChannelEntity, CalendarChannelEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    SyncRecordShareObjectCommand,
    AddMessageCampaignScheduledAtCommand,
    BackfillCoreWorkflowIdOnWorkflowVersionsCommand,
    MakeCallRecordingPrivateCommand,
    BackfillCallRecordingSharesCommand,
    MakeStandardChildObjectsInheritedCommand,
    BackfillChannelRecordSharesCommand,
    MakeMessagingAndCalendarPrivateCommand,
    AddShareRecordCommandMenuItemCommand,
  ],
})
export class V2_40_UpgradeVersionCommandModule {}
