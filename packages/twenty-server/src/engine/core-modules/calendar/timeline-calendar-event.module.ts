import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CalendarEventRecordingPreferenceResolver } from 'src/engine/core-modules/calendar/calendar-event-recording-preference.resolver';
import { CalendarEventRecordingPreferenceService } from 'src/engine/core-modules/calendar/calendar-event-recording-preference.service';
import { TimelineCalendarEventResolver } from 'src/engine/core-modules/calendar/timeline-calendar-event.resolver';
import { TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      CalendarChannelEntity,
      ConnectedAccountEntity,
      UserWorkspaceEntity,
    ]),
  ],
  exports: [],
  providers: [
    CalendarEventRecordingPreferenceResolver,
    CalendarEventRecordingPreferenceService,
    TimelineCalendarEventResolver,
    TimelineCalendarEventService,
  ],
})
export class TimelineCalendarEventModule {}
