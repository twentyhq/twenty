import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { type Histogram } from '@opentelemetry/api';
import { constants, PerformanceObserver } from 'perf_hooks';
import { getHeapStatistics } from 'v8';

import { isDefined } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

const MILLISECONDS_PER_SECOND = 1_000;
const GC_DURATION_BUCKETS_SECONDS = [
  0.0005, 0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5,
];

const HEAP_STATISTICS_CACHE_MS = 1_000;

const GC_KIND_BY_CONSTANT = new Map<number, string>([
  [constants.NODE_PERFORMANCE_GC_MINOR, 'minor'],
  [constants.NODE_PERFORMANCE_GC_MAJOR, 'major'],
  [constants.NODE_PERFORMANCE_GC_INCREMENTAL, 'incremental'],
  [constants.NODE_PERFORMANCE_GC_WEAKCB, 'weakcb'],
]);

const gcKindOf = (detail: unknown): string => {
  if (
    typeof detail !== 'object' ||
    detail === null ||
    !('kind' in detail) ||
    typeof detail.kind !== 'number'
  ) {
    return 'unknown';
  }

  return GC_KIND_BY_CONSTANT.get(detail.kind) ?? 'unknown';
};

@Injectable()
export class GcMetricsService implements OnModuleInit, OnModuleDestroy {
  private readonly pauseHistogram: Histogram;
  private observer?: PerformanceObserver;
  private heapStatistics?: ReturnType<typeof getHeapStatistics>;
  private heapStatisticsAt = 0;

  constructor(private readonly metricsService: MetricsService) {
    this.pauseHistogram = this.metricsService
      .getMeter()
      .createHistogram('twenty_nodejs_gc_duration_seconds', {
        description: 'V8 garbage collection pause duration, by collection kind',
        unit: 's',
        advice: { explicitBucketBoundaries: GC_DURATION_BUCKETS_SECONDS },
      });
  }

  onModuleInit(): void {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.pauseHistogram.record(entry.duration / MILLISECONDS_PER_SECOND, {
          kind: gcKindOf(entry.detail),
        });
      }
    });
    this.observer.observe({ entryTypes: ['gc'] });

    this.registerHeapGauges();
  }

  onModuleDestroy(): void {
    this.observer?.disconnect();
  }

  private registerHeapGauges(): void {
    const gauges: {
      metricName: string;
      description: string;
      read: (statistics: ReturnType<typeof getHeapStatistics>) => number;
    }[] = [
      {
        metricName: 'twenty_nodejs_heap_used_bytes',
        description: 'V8 heap occupied by live objects',
        read: (statistics) => statistics.used_heap_size,
      },
      {
        metricName: 'twenty_nodejs_heap_total_bytes',
        description: 'V8 heap committed by the process',
        read: (statistics) => statistics.total_heap_size,
      },
      {
        metricName: 'twenty_nodejs_heap_size_limit_bytes',
        description: 'V8 heap ceiling (--max-old-space-size)',
        read: (statistics) => statistics.heap_size_limit,
      },
      {
        metricName: 'twenty_nodejs_heap_external_bytes',
        description: 'Memory held outside the V8 heap by native objects',
        read: (statistics) => statistics.external_memory,
      },
    ];

    for (const gauge of gauges) {
      this.metricsService.createObservableGauge({
        metricName: gauge.metricName,
        options: { description: gauge.description, unit: 'By' },
        callback: async () => gauge.read(this.getHeapStatisticsSnapshot()),
      });
    }
  }

  private getHeapStatisticsSnapshot(): ReturnType<typeof getHeapStatistics> {
    const now = Date.now();

    if (
      !isDefined(this.heapStatistics) ||
      now - this.heapStatisticsAt > HEAP_STATISTICS_CACHE_MS
    ) {
      this.heapStatistics = getHeapStatistics();
      this.heapStatisticsAt = now;
    }

    return this.heapStatistics;
  }
}
