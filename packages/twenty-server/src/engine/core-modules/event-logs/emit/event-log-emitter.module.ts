import { Module } from '@nestjs/common';

import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { EventLogIngestionModule } from 'src/engine/core-modules/event-logs/ingest/event-log-ingestion.module';

// Producer entry point. Writes events straight through the sink (ClickHouse async_insert + live
// fan-out) via the ingestion module — no queue. Stays free of billing/enterprise/permissions and
// GraphQL, which remain read-side concerns in the viewer module.
@Module({
  imports: [EventLogIngestionModule],
  providers: [EventLogEmitterService],
  exports: [EventLogEmitterService],
})
export class EventLogEmitterModule {}
