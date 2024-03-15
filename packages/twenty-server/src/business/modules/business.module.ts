import { Module } from '@nestjs/common';

import { CalendarModule } from 'src/business/modules/calendar/calendar.module';
import { MessagingModule } from 'src/business/modules/message/messaging.module';

@Module({
  imports: [MessagingModule, CalendarModule],
  providers: [],
  exports: [],
})
export class BusinessModule {}
