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
    callback: () =>
      | number
      | Array<{ value: number; attributes: Attributes }>
      | Promise<number | Array<{ value: number; attributes: Attributes }>>;
    cacheValue?: boolean;
  }): ObservableGauge {
    const gauge = this.getMeter().createObservableGauge(metricName, options);

    gauge.addCallback(async (observableResult) => {
      if (cacheValue) {
        const cachedResult =
          await this.healthCacheStorage.get<
            number | Array<{ value: number; attributes: Attributes }>
          >(metricName);

        if (isDefined(cachedResult)) {
          this.observeResult(observableResult, cachedResult);

          return;
        }
      }

      try {
        const result = await callback();

        this.observeResult(observableResult, result);

        if (cacheValue) {
          await this.healthCacheStorage.set(
            metricName,
            result,
            METRICS_CACHE_TTL,
          );
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

  private observeResult(
    observableResult: Parameters<
      Parameters<ObservableGauge['addCallback']>[0]
    >[0],
    result: number | Array<{ value: number; attributes: Attributes }>,
  ) {
    if (typeof result === 'number') {
      observableResult.observe(result);

      return;
    }

    for (const observation of result) {
      observableResult.observe(observation.value, observation.attributes);
    }
  }

  createInfoGauge({
    metricName,
    options,
    attributesCallback,
  }: {
    metricName: string;
    options: MetricOptions;
    attributesCallback: () => Attributes | Promise<Attributes>;
  }): ObservableGauge {
    const normalizedName = metricName.endsWith('_info')
      ? metricName
      : `${metricName}_info`;

    const gauge = this.getMeter().createObservableGauge(
      normalizedName,
      options,
    );

    gauge.addCallback(async (observableResult) => {
      try {
        const attributes = await attributesCallback();

        observableResult.observe(1, attributes);
      } catch (error) {
        this.logger.error(
          `Failed to collect info gauge ${normalizedName}`,
          error,
        );
      }
    });

    return gauge;
  }

  async incrementCounterForEvent({
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

  async incrementCounterForEvents({
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

  incrementCounterBy({
    key,
    amount,
    attributes,
  }: {
    key: MetricsKeys;
    amount: number;
    attributes?: Attributes;
  }): void {
    this.getMeter().createCounter(key).add(amount, attributes);
  }

  recordHistogram({
    key,
    value,
    unit,
    attributes,
  }: {
    key: MetricsKeys;
    value: number;
    unit?: string;
    attributes?: Attributes;
  }): void {
    this.getMeter().createHistogram(key, { unit }).record(value, attributes);
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
