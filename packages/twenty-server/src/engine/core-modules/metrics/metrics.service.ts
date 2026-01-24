import { Injectable } from '@nestjs/common';

import {
  metrics,
  type Attributes,
  type Meter,
  type MetricOptions,
  type ObservableGauge,
  type ObservableResult,
} from '@opentelemetry/api';

import { MetricsCacheService } from 'src/engine/core-modules/metrics/metrics-cache.service';
import { type MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const METER_NAME = 'twenty-server';

@Injectable()
export class MetricsService {
  constructor(private readonly metricsCacheService: MetricsCacheService) {}

  getMeter(): Meter {
    return metrics.getMeter(METER_NAME);
  }

  createObservableGauge(
    name: string,
    options: MetricOptions,
    callback: (observableResult: ObservableResult) => void | Promise<void>,
  ): ObservableGauge {
    const gauge = this.getMeter().createObservableGauge(name, options);

    gauge.addCallback(callback);

    return gauge;
  }

  async incrementCounter({
    key,
    eventId,
    attributes,
    shouldStoreInCache = true,
  }: {
    key: MetricsKeys;
    eventId?: string;
    attributes?: Attributes;
    shouldStoreInCache?: boolean;
  }) {
    const counter = this.getMeter().createCounter(key);

    counter.add(1, attributes);

    if (shouldStoreInCache && eventId) {
      this.metricsCacheService.updateCounter(key, [eventId]);
    }
  }

  async batchIncrementCounter({
    key,
    eventIds,
    attributes,
    shouldStoreInCache = true,
  }: {
    key: MetricsKeys;
    eventIds: string[];
    attributes?: Attributes;
    shouldStoreInCache?: boolean;
  }) {
    const counter = this.getMeter().createCounter(key);

    counter.add(eventIds.length, attributes);

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
      groupedMetrics[metric.name] = await this.metricsCacheService.computeCount(
        {
          key: metric.cacheKey,
          date,
        },
      );
    }

    return groupedMetrics;
  }
}
