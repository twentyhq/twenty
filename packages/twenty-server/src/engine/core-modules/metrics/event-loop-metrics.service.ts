import { Injectable, OnModuleInit } from '@nestjs/common';

import {
  monitorEventLoopDelay,
  performance,
  type EventLoopUtilization,
  type IntervalHistogram,
} from 'perf_hooks';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

// Node reports event loop delay in nanoseconds
const NANOSECONDS_PER_SECOND = 1e9;

const toSeconds = (nanoseconds: number): number =>
  Number.isFinite(nanoseconds) ? nanoseconds / NANOSECONDS_PER_SECOND : 0;

// Surfaces Node.js event loop delay to Prometheus so it can be correlated with
// slow-DB-query Sentry issues: a span that awaits a fast query but resolves
// late points at a saturated loop rather than a slow database.
@Injectable()
export class EventLoopMetricsService implements OnModuleInit {
  private readonly delayHistogram: IntervalHistogram = monitorEventLoopDelay({
    resolution: 20,
  });
  private lastEventLoopUtilization: EventLoopUtilization =
    performance.eventLoopUtilization();

  constructor(private readonly metricsService: MetricsService) {}

  onModuleInit(): void {
    this.delayHistogram.enable();

    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_nodejs_eventloop_delay_seconds',
      options: {
        description: 'Node.js event loop delay since the previous scrape',
        unit: 's',
      },
      callback: async () => {
        const observations = [
          { value: toSeconds(this.delayHistogram.mean), attributes: { quantile: 'mean' } },
          { value: toSeconds(this.delayHistogram.percentile(50)), attributes: { quantile: 'p50' } },
          { value: toSeconds(this.delayHistogram.percentile(99)), attributes: { quantile: 'p99' } },
          { value: toSeconds(this.delayHistogram.max), attributes: { quantile: 'max' } },
        ];

        this.delayHistogram.reset();

        return observations;
      },
    });

    this.metricsService.createObservableGauge({
      metricName: 'twenty_nodejs_eventloop_utilization',
      options: {
        description:
          'Fraction of time the Node.js event loop was busy since the previous scrape',
        unit: '1',
      },
      callback: async () => {
        const current = performance.eventLoopUtilization();
        const delta = performance.eventLoopUtilization(
          current,
          this.lastEventLoopUtilization,
        );

        this.lastEventLoopUtilization = current;

        return delta.utilization;
      },
    });
  }
}
