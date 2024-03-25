import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { TimelineCalendarEventResolver } from 'src/engine/core-modules/calendar/timeline-calendar-event.resolver';
import { TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';

@Module({
  imports: [WorkspaceDataSourceModule, UserModule],
  exports: [],
  providers: [TimelineCalendarEventResolver, TimelineCalendarEventService],
})
export class TimelineCalendarEventModule {}
