import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ConvertLogicFunctionsToPrebuiltCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788338950836-convert-logic-functions-to-prebuilt.command';
import { BackfillRecordFormCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788524477000-backfill-record-form.command';
import { SyncRecordShareObjectCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788553681056-sync-record-share-object.command';
import { MakeCallRecordingPrivateCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788555747635-make-call-recording-private.command';
import { BackfillCallRecordingSharesCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788555749940-backfill-call-recording-shares.command';
import { BackfillChannelRecordSharesCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788561701130-backfill-channel-record-shares.command';
import { MakeMessagingAndCalendarPrivateCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788573079880-make-messaging-and-calendar-private.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { RecordShareModule } from 'src/engine/record-share/record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { CalendarCommonModule } from 'src/modules/calendar/common/calendar-common.module';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';

@Module({
  imports: [
    ApplicationModule,
    CalendarCommonModule,
    FeatureFlagModule,
    MessagingCommonModule,
    RecordShareModule,
    TypeORMModule,
    TypeOrmModule.forFeature([MessageChannelEntity, CalendarChannelEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    ConvertLogicFunctionsToPrebuiltCommand,
    BackfillRecordFormCommand,
    SyncRecordShareObjectCommand,
    MakeCallRecordingPrivateCommand,
    BackfillCallRecordingSharesCommand,
    BackfillChannelRecordSharesCommand,
    MakeMessagingAndCalendarPrivateCommand,
  ],
})
export class V2_39_UpgradeVersionCommandModule {}
