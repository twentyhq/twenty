import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { CalendarEventCleanerService } from 'src/apps/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';
import { CalendarEventObjectMetadata } from 'src/apps/calendar/standard-objects/calendar-event.object-metadata';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([CalendarEventObjectMetadata]),
  ],
  providers: [CalendarEventCleanerService],
  exports: [CalendarEventCleanerService],
})
export class CalendarEventCleanerModule {}
