import { Global, Module } from '@nestjs/common';

import { MetadataEventsToDbListener } from 'src/engine/metadata-event-emitter/listeners/metadata-events-to-db.listener';
import { MetadataEventEmitter } from 'src/engine/metadata-event-emitter/metadata-event-emitter';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Global()
@Module({
  imports: [SubscriptionsModule, WorkspaceCacheModule],
  providers: [MetadataEventEmitter, MetadataEventsToDbListener],
  exports: [MetadataEventEmitter],
})
export class MetadataEventEmitterModule {}
