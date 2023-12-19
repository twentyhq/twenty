import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AnalyticsService } from './analytics.service';
import { AnalyticsResolver } from './analytics.resolver';

@Module({
  providers: [AnalyticsResolver, AnalyticsService],
  imports: [
    HttpModule.register({
      baseURL: 'https://t.twenty.com/api/v1/s2s',
    }),
  ],
})
export class AnalyticsModule {}
