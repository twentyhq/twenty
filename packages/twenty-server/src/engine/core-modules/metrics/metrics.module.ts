import { Module } from '@nestjs/common';

import { MetricsCacheService } from 'src/engine/core-modules/metrics/metrics-cache.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { NodeRuntimeMetricsService } from 'src/engine/core-modules/metrics/node-runtime-metrics.service';

@Module({
  providers: [MetricsService, MetricsCacheService, NodeRuntimeMetricsService],
  exports: [MetricsService, MetricsCacheService],
})
export class MetricsModule {}
