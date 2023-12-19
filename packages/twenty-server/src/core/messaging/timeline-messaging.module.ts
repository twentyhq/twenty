import { Module } from '@nestjs/common';

import { TimelineMessagingResolver } from 'src/core/messaging/timeline-messaging.resolver';

@Module({
  imports: [],
  exports: [],
  providers: [TimelineMessagingResolver],
})
export class TimelineMessagingModule {}
