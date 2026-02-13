import { Global, Module } from '@nestjs/common';

import { MetadataEventEmitter } from 'src/engine/metadata-event-emitter/metadata-event-emitter';
import { MetadataEventsToDbListener } from 'src/engine/metadata-event-emitter/listeners/metadata-events-to-db.listener';

@Global()
@Module({
  providers: [MetadataEventEmitter, MetadataEventsToDbListener],
  exports: [MetadataEventEmitter],
})
export class MetadataEventEmitterModule {}
