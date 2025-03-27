import { Injectable } from '@nestjs/common';

import { metrics } from '@opentelemetry/api';

import { MetricsCacheService } from 'src/engine/core-modules/metrics/metrics-cache.service';
import {
  MeterKeys,
  MetricsCounterKeys,
} from 'src/engine/core-modules/metrics/types/metrics-counter-keys.type';

@Injectable()
export class MetricsService {
  constructor(private readonly metricsCacheService: MetricsCacheService) {}

  async incrementCounter(
    key: MetricsCounterKeys,
    items: string[],
    meterName: MeterKeys,
    shouldStoreInCache = true,
  ) {
    const meter = metrics.getMeter(meterName);
    const counter = meter.createCounter(key);

    counter.add(items.length);

    if (shouldStoreInCache) {
      this.metricsCacheService.updateCounter(key, items);
    }
  }

  async groupMetrics(
    metrics: { name: string; cacheKey: MetricsCounterKeys }[],
  ): Promise<Record<string, number>> {
    const groupedMetrics = {} as Record<string, number>;

    const date = Date.now();

    for (const metric of metrics) {
      const metricValue = await this.metricsCacheService.computeCount({
        key: metric.cacheKey,
        date,
      });

      groupedMetrics[metric.name] = metricValue;
    }

    return groupedMetrics;
  }
}
