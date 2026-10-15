import { Module } from '@nestjs/common';

import { ApplicationRegistrationMetricService } from 'src/engine/core-modules/application/application-registration-analytics/application-registration-metric.service';
import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';

@Module({
  imports: [EventLogEmitterModule],
  providers: [ApplicationRegistrationMetricService],
  exports: [ApplicationRegistrationMetricService],
})
export class ApplicationRegistrationAnalyticsModule {}
