import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceMemberObjectMetadata } from 'src/apps/workspace-member/standard-objects/workspace-member.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/apps/connected-account/standard-objects/connected-account.object-metadata';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import { CalendarChannelObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-channel.object-metadata';
import { CalendarEventFindManyPreQueryHook } from 'src/apps/calendar/query-hooks/calendar-event/calendar-event-find-many.pre-query.hook';
import { CalendarEventFindOnePreQueryHook } from 'src/apps/calendar/query-hooks/calendar-event/calendar-event-find-one.pre-query-hook';
import { CanAccessCalendarEventService } from 'src/apps/calendar/query-hooks/calendar-event/services/can-access-calendar-event.service';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      CalendarChannelEventAssociationObjectMetadata,
      CalendarChannelObjectMetadata,
      ConnectedAccountObjectMetadata,
      WorkspaceMemberObjectMetadata,
    ]),
  ],
  providers: [
    CanAccessCalendarEventService,
    {
      provide: CalendarEventFindOnePreQueryHook.name,
      useClass: CalendarEventFindOnePreQueryHook,
    },
    {
      provide: CalendarEventFindManyPreQueryHook.name,
      useClass: CalendarEventFindManyPreQueryHook,
    },
  ],
})
export class CalendarQueryHookModule {}
