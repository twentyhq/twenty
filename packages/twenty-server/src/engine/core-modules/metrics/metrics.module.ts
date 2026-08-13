import { Module } from '@nestjs/common';

import { EventLoopMetricsService } from 'src/engine/core-modules/metrics/event-loop-metrics.service';
import { GcMetricsService } from 'src/engine/core-modules/metrics/gc-metrics.service';
import { MetricsCacheService } from 'src/engine/core-modules/metrics/metrics-cache.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

@Module({
  providers: [
    MetricsService,
    MetricsCacheService,
    EventLoopMetricsService,
    GcMetricsService,
  ],
  exports: [MetricsService, MetricsCacheService],
})
export class MetricsModule {}
