import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { type Histogram } from '@opentelemetry/api';
import { performance, type EventLoopUtilization } from 'perf_hooks';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

const SAMPLE_INTERVAL_MS = 1_000;
const MILLISECONDS_PER_SECOND = 1_000;
const DELAY_BUCKETS_SECONDS = [
  0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5,
];

// Sampled as a histogram (not per-pod percentile gauges) so Grafana can
// re-aggregate a true fleet-wide quantile across pods.
@Injectable()
export class EventLoopMetricsService implements OnModuleInit, OnModuleDestroy {
  private readonly delayHistogram: Histogram;
  private sampler?: NodeJS.Timeout;
  private lastSampleAt = performance.now();
  private lastEventLoopUtilization: EventLoopUtilization =
    performance.eventLoopUtilization();

  constructor(private readonly metricsService: MetricsService) {
    this.delayHistogram = this.metricsService
      .getMeter()
      .createHistogram('twenty_nodejs_eventloop_delay_seconds', {
        description: 'Node.js event loop lag, sampled per interval',
        unit: 's',
        advice: { explicitBucketBoundaries: DELAY_BUCKETS_SECONDS },
      });
  }

  onModuleInit(): void {
    this.lastSampleAt = performance.now();

    this.sampler = setInterval(() => {
      const now = performance.now();
      const lagMs = Math.max(0, now - this.lastSampleAt - SAMPLE_INTERVAL_MS);

      this.lastSampleAt = now;
      this.delayHistogram.record(lagMs / MILLISECONDS_PER_SECOND);
    }, SAMPLE_INTERVAL_MS);
    this.sampler.unref();

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

  onModuleDestroy(): void {
    if (this.sampler) {
      clearInterval(this.sampler);
    }
  }
}
