import { Module } from '@nestjs/common';

import { EventLogLiveService } from 'src/engine/core-modules/event-logs/live/event-log-live.service';

@Module({
  providers: [EventLogLiveService],
  exports: [EventLogLiveService],
})
export class EventLogLiveModule {}
