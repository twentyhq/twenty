import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/engine-metadata/data-source/data-source.module';
import { CalendarEventModule } from 'src/business/modules/calendar/repositories/calendar-event/calendar-event.module';
import { CalendarEventCleanerService } from 'src/business/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';

@Module({
  imports: [DataSourceModule, TypeORMModule, CalendarEventModule],
  providers: [CalendarEventCleanerService],
  exports: [CalendarEventCleanerService],
})
export class CalendarEventCleanerModule {}
