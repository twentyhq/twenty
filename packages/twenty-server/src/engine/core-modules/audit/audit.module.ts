import { Module } from '@nestjs/common';

import { ClickHouseModule } from 'src/database/clickHouse/clickhouse.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { AnalyticsResolver } from './analytics.resolver';

import { AnalyticsService } from './services/analytics.service';

@Module({
  providers: [AnalyticsResolver, AnalyticsService],
  imports: [JwtModule, ClickHouseModule],
  exports: [AnalyticsService],
})
export class AuditModule {}
