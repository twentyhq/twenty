import { Module } from '@nestjs/common';

import { ApplicationRepeatedEventRecorderService } from 'src/engine/core-modules/event-logs/emit/application-repeated-event-recorder.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { EventLogIngestionModule } from 'src/engine/core-modules/event-logs/ingest/event-log-ingestion.module';

@Module({
  imports: [EventLogIngestionModule],
  providers: [EventLogEmitterService, ApplicationRepeatedEventRecorderService],
  exports: [EventLogEmitterService, ApplicationRepeatedEventRecorderService],
})
export class EventLogEmitterModule {}
