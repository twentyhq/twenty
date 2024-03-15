import { Module } from '@nestjs/common';

import { CalendarEventService } from 'src/business/modules/calendar/repositories/calendar-event/calendar-event.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [CalendarEventService],
  exports: [CalendarEventService],
})
export class CalendarEventModule {}
