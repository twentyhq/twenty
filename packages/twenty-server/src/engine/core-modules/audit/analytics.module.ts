import { Module } from '@nestjs/common';

import { ClickhouseService } from 'src/engine/core-modules/audit/services/clickhouse.service';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { AnalyticsResolver } from './analytics.resolver';

import { AnalyticsService } from './services/analytics.service';

@Module({
  providers: [AnalyticsResolver, AnalyticsService, ClickhouseService],
  imports: [JwtModule],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
