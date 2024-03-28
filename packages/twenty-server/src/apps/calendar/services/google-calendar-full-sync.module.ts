import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { GoogleCalendarFullSyncService } from 'src/apps/calendar/services/google-calendar-full-sync.service';
import { CalendarProvidersModule } from 'src/apps/calendar/services/providers/calendar-providers.module';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import { CalendarChannelObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-channel.object-metadata';
import { CalendarEventAttendeeObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-event-attendee.object-metadata';
import { CalendarEventObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-event.object-metadata';
import { BlocklistObjectMetadata } from 'src/apps/connected-account/standard-objects/blocklist.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/apps/connected-account/standard-objects/connected-account.object-metadata';
import { PersonObjectMetadata } from 'src/apps/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/apps/workspace-member/standard-objects/workspace-member.object-metadata';

@Module({
  imports: [
    CalendarProvidersModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      CalendarEventObjectMetadata,
      CalendarChannelObjectMetadata,
      CalendarChannelEventAssociationObjectMetadata,
      CalendarEventAttendeeObjectMetadata,
      BlocklistObjectMetadata,
      PersonObjectMetadata,
      WorkspaceMemberObjectMetadata,
    ]),
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    WorkspaceDataSourceModule,
  ],
  providers: [GoogleCalendarFullSyncService],
  exports: [GoogleCalendarFullSyncService],
})
export class GoogleCalendarFullSyncModule {}
