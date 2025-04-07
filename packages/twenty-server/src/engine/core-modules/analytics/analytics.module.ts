import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { ClickhouseService } from 'src/engine/core-modules/analytics/services/clickhouse.service';

import { AnalyticsResolver } from './analytics.resolver';

import { AnalyticsService } from './services/analytics.service';

@Module({
  providers: [AnalyticsResolver, AnalyticsService, ClickhouseService],
  imports: [JwtModule, ScheduleModule.forRoot(), EnvironmentModule],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
