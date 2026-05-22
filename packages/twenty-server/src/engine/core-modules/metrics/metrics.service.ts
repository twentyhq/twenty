import { Injectable, Logger } from '@nestjs/common';

import {
  metrics,
  type Attributes,
  type Meter,
  type MetricOptions,
  type ObservableGauge,
} from '@opentelemetry/api';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsCacheService } from 'src/engine/core-modules/metrics/metrics-cache.service';
import { type MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const METER_NAME = 'twenty-server';
const METRICS_CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Returned by an observable-gauge callback when the metric needs to
 * carry attributes (labels) alongside its numeric value. Used for the
 * Prometheus "info metric" pattern (value = 1, labels carry the
 * interesting string), e.g. `twenty_upgrade_instance_info { version }`.
 */
export type GaugeObservation = {
  value: number;
  attributes?: Attributes;
};

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    private readonly metricsCacheService: MetricsCacheService,
    @InjectCacheStorage(CacheStorageNamespace.EngineHealth)
    private readonly healthCacheStorage: CacheStorageService,
  ) {}

  getMeter(): Meter {
    return metrics.getMeter(METER_NAME);
  }

  createObservableGauge({
    metricName,
    options,
    callback,
    cacheValue = false,
  }: {
    metricName: string;
    options: MetricOptions;
    /**
     * Return a bare `number` for a plain gauge, or `{ value, attributes }`
     * to attach labels (e.g. a version/build string on an info metric).
     */
    callback: () =>
      | number
      | GaugeObservation
      | Promise<number | GaugeObservation>;
    /**
     * Cache the observed value in Redis for 1 minute so scrape cadence
     * doesn't repeatedly hit the underlying callback. Only supported
     * for callbacks that return a bare number — attribute-bearing
     * observations are not cached at this layer (callers needing it
     * should cache upstream).
     */
    cacheValue?: boolean;
  }): ObservableGauge {
    const gauge = this.getMeter().createObservableGauge(metricName, options);

    gauge.addCallback(async (observableResult) => {
      if (cacheValue) {
        const cachedResult =
          await this.healthCacheStorage.get<number>(metricName);

        if (isDefined(cachedResult)) {
          observableResult.observe(cachedResult);

          return;
        }
      }

      try {
        const result = await callback();

        if (typeof result === 'number') {
          observableResult.observe(result);

          if (cacheValue) {
            await this.healthCacheStorage.set(
              metricName,
              result,
              METRICS_CACHE_TTL,
            );
          }
        } else {
          observableResult.observe(result.value, result.attributes);
        }
      } catch (error) {
        this.logger.error(
          `Failed to collect gauge metric ${metricName}`,
          error,
        );
      }
    });

    return gauge;
  }

  async incrementCounter({
    key,
    eventId,
    attributes,
    shouldStoreInCache = true,
    debugLog,
  }: {
    key: MetricsKeys;
    eventId?: string;
    attributes?: Attributes;
    shouldStoreInCache?: boolean;
    debugLog?: string;
  }) {
    const counter = this.getMeter().createCounter(key);

    counter.add(1, attributes);

    if (shouldStoreInCache && eventId) {
      try {
        await this.metricsCacheService.updateCounter(key, [eventId]);
      } catch (error) {
        this.logger.error(`Failed to update metrics cache for ${key}`, error);
      }
    }

    if (isDefined(debugLog)) {
      this.logger.debug(debugLog);
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
      await this.metricsCacheService.updateCounter(key, eventIds);
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
