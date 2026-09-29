import { Module } from '@nestjs/common';

import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { TimelineCalendarEventResolver } from 'src/engine/core-modules/calendar/timeline-calendar-event.resolver';
import { TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';
import { RelatedPersonIdsModule } from 'src/engine/core-modules/related-person-ids/related-person-ids.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { TargetModule } from 'src/engine/core-modules/target/target.module';

@Module({
  imports: [FileUrlModule, UserModule, RelatedPersonIdsModule, TargetModule],
  exports: [],
  providers: [TimelineCalendarEventResolver, TimelineCalendarEventService],
})
export class TimelineCalendarEventModule {}
