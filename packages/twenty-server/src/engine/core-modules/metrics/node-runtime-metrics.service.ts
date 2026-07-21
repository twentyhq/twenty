import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import { type Histogram } from '@opentelemetry/api';
import {
  constants,
  monitorEventLoopDelay,
  performance,
  PerformanceObserver,
  type EventLoopUtilization,
  type IntervalHistogram,
  type NodeGCPerformanceDetail,
  type PerformanceObserverEntryList,
} from 'node:perf_hooks';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const EVENT_LOOP_DELAY_RESOLUTION_MS = 10;
const EVENT_LOOP_METRICS_COLLECTION_INTERVAL_MS = 30_000;
const NANOSECONDS_PER_SECOND = 1_000_000_000;

type EventLoopDelaySnapshot = {
  p50: number;
  p99: number;
  max: number;
};

type HeapSizeSnapshot = {
  used: number;
  unused: number;
};

@Injectable()
export class NodeRuntimeMetricsService
  implements OnModuleInit, OnModuleDestroy
{
  private eventLoopDelayMonitor: IntervalHistogram | undefined;
  private garbageCollectionObserver: PerformanceObserver | undefined;
  private garbageCollectionDurationHistogram: Histogram | undefined;
  private collectionInterval: NodeJS.Timeout | undefined;
  private previousEventLoopUtilization: EventLoopUtilization | undefined;
  private eventLoopUtilization = 0;
  private eventLoopDelaySnapshot: EventLoopDelaySnapshot = {
    p50: 0,
    p99: 0,
    max: 0,
  };
  private heapSizeSnapshot: HeapSizeSnapshot = { used: 0, unused: 0 };

  constructor(
    private readonly metricsService: MetricsService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  onModuleInit(): void {
    if (this.twentyConfigService.get('METER_DRIVER').length === 0) {
      return;
    }

    this.registerMetrics();
    this.collectHeapSizeMetrics();

    this.eventLoopDelayMonitor = monitorEventLoopDelay({
      resolution: EVENT_LOOP_DELAY_RESOLUTION_MS,
    });
    this.eventLoopDelayMonitor.enable();
    this.previousEventLoopUtilization = performance.eventLoopUtilization();

    this.garbageCollectionObserver = new PerformanceObserver((entryList) => {
      this.recordGarbageCollections(entryList);
    });
    this.garbageCollectionObserver.observe({ entryTypes: ['gc'] });

    this.collectionInterval = setInterval(() => {
      this.collectEventLoopMetrics();
    }, EVENT_LOOP_METRICS_COLLECTION_INTERVAL_MS);
    this.collectionInterval.unref();
  }

  onModuleDestroy(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }

    this.eventLoopDelayMonitor?.disable();
    this.garbageCollectionObserver?.disconnect();
  }

  private registerMetrics(): void {
    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_nodejs_event_loop_delay_seconds',
      options: {
        description:
          'Node.js event loop delay over the latest 30 second window',
        unit: 's',
      },
      callback: async () => [
        {
          value: this.eventLoopDelaySnapshot.p50,
          attributes: { statistic: 'p50' },
        },
        {
          value: this.eventLoopDelaySnapshot.p99,
          attributes: { statistic: 'p99' },
        },
        {
          value: this.eventLoopDelaySnapshot.max,
          attributes: { statistic: 'max' },
        },
      ],
    });

    this.metricsService.createObservableGauge({
      metricName: 'twenty_nodejs_event_loop_utilization',
      options: {
        description:
          'Fraction of time the Node.js event loop was active over the latest 30 second window',
      },
      callback: () => this.eventLoopUtilization,
    });

    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_nodejs_heap_size_bytes',
      options: {
        description:
          'Currently allocated Node.js heap size by mutually exclusive state',
        unit: 'By',
      },
      callback: async () => [
        {
          value: this.heapSizeSnapshot.used,
          attributes: { state: 'used' },
        },
        {
          value: this.heapSizeSnapshot.unused,
          attributes: { state: 'unused' },
        },
      ],
    });

    this.garbageCollectionDurationHistogram = this.metricsService
      .getMeter()
      .createHistogram('twenty_nodejs_gc_duration_milliseconds', {
        description: 'Node.js garbage collection duration',
        unit: 'ms',
      });
  }

  private collectEventLoopMetrics(): void {
    const eventLoopDelayMonitor = this.eventLoopDelayMonitor;

    if (eventLoopDelayMonitor && eventLoopDelayMonitor.count > 0) {
      this.eventLoopDelaySnapshot = {
        p50: this.toEventLoopDelaySeconds(eventLoopDelayMonitor.percentile(50)),
        p99: this.toEventLoopDelaySeconds(eventLoopDelayMonitor.percentile(99)),
        max: this.toEventLoopDelaySeconds(eventLoopDelayMonitor.max),
      };
      eventLoopDelayMonitor.reset();
    }

    const currentEventLoopUtilization = performance.eventLoopUtilization();

    if (this.previousEventLoopUtilization) {
      this.eventLoopUtilization = performance.eventLoopUtilization(
        currentEventLoopUtilization,
        this.previousEventLoopUtilization,
      ).utilization;
    }

    this.previousEventLoopUtilization = currentEventLoopUtilization;
    this.collectHeapSizeMetrics();
  }

  private collectHeapSizeMetrics(): void {
    const { heapUsed, heapTotal } = process.memoryUsage();

    this.heapSizeSnapshot = {
      used: heapUsed,
      unused: Math.max(0, heapTotal - heapUsed),
    };
  }

  private toEventLoopDelaySeconds(nanoseconds: number): number {
    const samplingIntervalNanoseconds =
      EVENT_LOOP_DELAY_RESOLUTION_MS * 1_000_000;

    return (
      Math.max(0, nanoseconds - samplingIntervalNanoseconds) /
      NANOSECONDS_PER_SECOND
    );
  }

  private recordGarbageCollections(
    entryList: PerformanceObserverEntryList,
  ): void {
    for (const entry of entryList.getEntries()) {
      const detail = entry.detail as NodeGCPerformanceDetail | undefined;

      this.garbageCollectionDurationHistogram?.record(entry.duration, {
        kind: this.getGarbageCollectionKind(detail?.kind),
      });
    }
  }

  private getGarbageCollectionKind(kind: number | undefined): string {
    switch (kind) {
      case constants.NODE_PERFORMANCE_GC_MINOR:
        return 'minor';
      case constants.NODE_PERFORMANCE_GC_MAJOR:
        return 'major';
      case constants.NODE_PERFORMANCE_GC_INCREMENTAL:
        return 'incremental';
      case constants.NODE_PERFORMANCE_GC_WEAKCB:
        return 'weakcb';
      default:
        return 'unknown';
    }
  }
}
