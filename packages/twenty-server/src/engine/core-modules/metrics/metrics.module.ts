import { Module } from '@nestjs/common';

import { MetricsCacheService } from 'src/engine/core-modules/metrics/metrics-cache.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { PrometheusController } from 'src/engine/core-modules/metrics/prometheus.controller';
import { PrometheusService } from 'src/engine/core-modules/metrics/prometheus.service';

@Module({
  controllers: [PrometheusController],
  providers: [MetricsService, MetricsCacheService, PrometheusService],
  exports: [MetricsService, MetricsCacheService, PrometheusService],
})
export class MetricsModule {}
