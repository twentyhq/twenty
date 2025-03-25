import { Module } from '@nestjs/common';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { AnalyticsResolver } from './analytics.resolver';
import { AnalyticsService } from './analytics.service';

@Module({
  providers: [AnalyticsResolver, AnalyticsService],
  imports: [JwtModule],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
