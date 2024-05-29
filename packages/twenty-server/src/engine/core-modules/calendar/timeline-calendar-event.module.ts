import { Module } from '@nestjs/common';

import { UserModule } from 'src/engine/core-modules/user/user.module';
import { TimelineCalendarEventResolver } from 'src/engine/core-modules/calendar/timeline-calendar-event.resolver';
import { TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Module({
  imports: [
    TwentyORMModule.forFeature([
      CalendarEventWorkspaceEntity,
      PersonWorkspaceEntity,
    ]),
    UserModule,
  ],
  exports: [],
  providers: [TimelineCalendarEventResolver, TimelineCalendarEventService],
})
export class TimelineCalendarEventModule {}
