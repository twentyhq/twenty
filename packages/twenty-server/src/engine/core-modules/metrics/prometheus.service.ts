import { Injectable, OnModuleInit } from '@nestjs/common';

import {
  collectDefaultMetrics,
  Gauge,
  type GaugeConfiguration,
  Registry,
} from 'prom-client';

type GaugeConfigWithCollect<T extends string> = Omit<
  GaugeConfiguration<T>,
  'collect'
> & {
  collect?: (gauge: Gauge<T>) => void | Promise<void>;
};

@Injectable()
export class PrometheusService implements OnModuleInit {
  private readonly registry = new Registry();

  onModuleInit() {
    collectDefaultMetrics({ register: this.registry });
  }

  createGauge<T extends string>(config: GaugeConfigWithCollect<T>): Gauge<T> {
    const { collect, ...gaugeConfig } = config;

    const gauge = new Gauge<T>({
      ...gaugeConfig,
      registers: [this.registry],
      ...(collect && {
        collect: async () => {
          await collect(gauge);
        },
      }),
    });

    return gauge;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
