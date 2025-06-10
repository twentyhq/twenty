import { Injectable } from '@nestjs/common';

import { metrics } from '@opentelemetry/api';

import { MetricsCacheService } from 'src/engine/core-modules/metrics/metrics-cache.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

@Injectable()
export class MetricsService {
  constructor(private readonly metricsCacheService: MetricsCacheService) {}

  async incrementCounter({
    key,
    eventId,
    shouldStoreInCache = true,
  }: {
    key: MetricsKeys;
    eventId: string;
    shouldStoreInCache?: boolean;
  }) {
    //TODO : Define meter name usage in monitoring
    const meter = metrics.getMeter('twenty-server');
    const counter = meter.createCounter(key);

    counter.add(1);

    if (shouldStoreInCache) {
      this.metricsCacheService.updateCounter(key, [eventId]);
    }
  }

  async batchIncrementCounter({
    key,
    eventIds,
    shouldStoreInCache = true,
  }: {
    key: MetricsKeys;
    eventIds: string[];
    shouldStoreInCache?: boolean;
  }) {
    //TODO : Define meter name usage in monitoring
    const meter = metrics.getMeter('twenty-server');
    const counter = meter.createCounter(key);

    counter.add(eventIds.length);

    if (shouldStoreInCache) {
      this.metricsCacheService.updateCounter(key, eventIds);
    }
  }

  async groupMetrics(
    metrics: { name: string; cacheKey: MetricsKeys }[],
  ): Promise<Record<string, number>> {
    const groupedMetrics: Record<string, number> = {};

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
