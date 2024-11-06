import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { AnalyticsResolver } from './analytics.resolver';
import { AnalyticsService } from './analytics.service';

const TINYBIRD_BASE_URL = 'https://api.eu-central-1.aws.tinybird.co/v0';

@Module({
  providers: [AnalyticsResolver, AnalyticsService],
  imports: [
    JwtModule,
    HttpModule.register({
      baseURL: TINYBIRD_BASE_URL,
    }),
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
