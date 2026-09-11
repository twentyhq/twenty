import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { BackfillCallRecordingSharesCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789140000001-backfill-call-recording-shares.command';
import { BackfillChannelRecordSharesCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789140200000-backfill-channel-record-shares.command';
import { CalendarCommonModule } from 'src/modules/calendar/common/calendar-common.module';
import { MakeCallRecordingPrivateCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789140000000-make-call-recording-private.command';
import { MakeStandardChildObjectsInheritedCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789140100001-make-standard-child-objects-inherited.command';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';
import { RecordShareModule } from 'src/engine/record-share/record-share.module';

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
    MakeCallRecordingPrivateCommand,
    BackfillCallRecordingSharesCommand,
    MakeStandardChildObjectsInheritedCommand,
    BackfillChannelRecordSharesCommand,
  ],
})
export class V2_41_UpgradeVersionCommandModule {}
