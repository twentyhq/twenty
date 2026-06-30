import { Module } from '@nestjs/common';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { EventLogLiveService } from 'src/engine/core-modules/event-logs/live/event-log-live.service';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';

@Module({
  imports: [CacheStorageModule, SubscriptionsModule],
  providers: [EventLogLiveService],
  exports: [EventLogLiveService],
})
export class EventLogLiveModule {}
