import { Module } from '@nestjs/common';

import { ClickHouseModule } from 'src/database/clickhouse/clickhouse.module';
import { ApplicationRegistrationAnalyticsService } from 'src/engine/core-modules/application/application-registration-analytics/application-registration-analytics.service';
import { ApplicationRegistrationMetricService } from 'src/engine/core-modules/application/application-registration-analytics/application-registration-metric.service';
import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';

@Module({
  imports: [ClickHouseModule, EventLogEmitterModule],
  providers: [
    ApplicationRegistrationMetricService,
    ApplicationRegistrationAnalyticsService,
  ],
  exports: [
    ApplicationRegistrationMetricService,
    ApplicationRegistrationAnalyticsService,
  ],
})
export class ApplicationRegistrationAnalyticsModule {}
