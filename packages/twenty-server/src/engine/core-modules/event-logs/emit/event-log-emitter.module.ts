import { Module } from '@nestjs/common';

import { ApplicationLogDeduplicationService } from 'src/engine/core-modules/event-logs/emit/application-log-deduplication.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { EventLogIngestionModule } from 'src/engine/core-modules/event-logs/ingest/event-log-ingestion.module';

@Module({
  imports: [EventLogIngestionModule],
  providers: [EventLogEmitterService, ApplicationLogDeduplicationService],
  exports: [EventLogEmitterService, ApplicationLogDeduplicationService],
})
export class EventLogEmitterModule {}
