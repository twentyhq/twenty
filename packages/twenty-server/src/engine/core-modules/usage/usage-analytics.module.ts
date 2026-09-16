/* @license Enterprise */

import { Module } from '@nestjs/common';

import { ClickHouseModule } from 'src/database/clickhouse/clickhouse.module';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';

@Module({
  imports: [ClickHouseModule],
  providers: [UsageAnalyticsService],
  exports: [UsageAnalyticsService],
})
export class UsageAnalyticsModule {}
