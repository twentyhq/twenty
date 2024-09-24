import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AnalyticsResolver } from './analytics.resolver';
import { AnalyticsService } from './analytics.service';

const BASE_URL_POST = 'https://api.eu-central-1.aws.tinybird.co/v0';

@Module({
  providers: [AnalyticsResolver, AnalyticsService],
  imports: [
    HttpModule.register({
      baseURL: BASE_URL_POST,
    }),
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
