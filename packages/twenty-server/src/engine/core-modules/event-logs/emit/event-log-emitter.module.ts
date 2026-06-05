import { Module } from '@nestjs/common';

import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';

// Lightweight producer entry point: emit/enqueue only. Imported by every event producer.
// Intentionally free of sinks, ClickHouse, billing, enterprise, permissions and GraphQL concerns
// (MessageQueueModule and TwentyConfigModule are global, so no imports are required).
@Module({
  providers: [EventLogEmitterService],
  exports: [EventLogEmitterService],
})
export class EventLogEmitterModule {}
