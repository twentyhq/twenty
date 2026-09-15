import { Module } from '@nestjs/common';

import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { EventLogIngestionModule } from 'src/engine/core-modules/event-logs/ingest/event-log-ingestion.module';

@Module({
  imports: [EventLogIngestionModule],
  providers: [EventLogEmitterService],
  exports: [EventLogEmitterService],
})
export class EventLogEmitterModule {}
