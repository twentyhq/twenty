import { Module } from '@nestjs/common';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { EventLogLiveService } from 'src/engine/core-modules/event-logs/live/event-log-live.service';

// Cache-backed live fan-out, shared by the worker (publish, via ingest) and the API (subscribe, via the viewer).
@Module({
  imports: [CacheStorageModule],
  providers: [EventLogLiveService],
  exports: [EventLogLiveService],
})
export class EventLogLiveModule {}
