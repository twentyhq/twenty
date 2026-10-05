import { Module } from '@nestjs/common';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { EventLogLiveService } from 'src/engine/core-modules/event-logs/live/event-log-live.service';

@Module({
  imports: [CacheStorageModule],
  providers: [EventLogLiveService],
  exports: [EventLogLiveService],
})
export class EventLogLiveModule {}
