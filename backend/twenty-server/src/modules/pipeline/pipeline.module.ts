import { Module } from '@nestjs/common';

import { AnalyticsService } from 'src/modules/pipeline/services/analytics.service';
import { ForecastingService } from 'src/modules/pipeline/services/forecasting.service';
import { PipelineService } from 'src/modules/pipeline/services/pipeline.service';

@Module({
  providers: [PipelineService, AnalyticsService, ForecastingService],
  exports: [PipelineService, AnalyticsService, ForecastingService],
})
export class PipelineModule {}
