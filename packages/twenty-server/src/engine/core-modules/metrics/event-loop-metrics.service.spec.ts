import { monitorEventLoopDelay, performance } from 'perf_hooks';

import { EventLoopMetricsService } from 'src/engine/core-modules/metrics/event-loop-metrics.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

jest.mock('perf_hooks', () => ({
  monitorEventLoopDelay: jest.fn(),
  performance: { eventLoopUtilization: jest.fn() },
}));

type MultiGaugeCallback = () => Promise<
  Array<{ value: number; attributes: { quantile: string } }>
>;
type GaugeCallback = () => Promise<number>;

describe('EventLoopMetricsService', () => {
  let delayCallback: MultiGaugeCallback;
  let utilizationCallback: GaugeCallback;
  let histogram: {
    enable: jest.Mock;
    reset: jest.Mock;
    percentile: jest.Mock;
    mean: number;
    max: number;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    histogram = {
      enable: jest.fn(),
      reset: jest.fn(),
      // percentile(50) -> 0.001s, percentile(99) -> 0.01s
      percentile: jest.fn((quantile: number) =>
        quantile === 50 ? 1_000_000 : 10_000_000,
      ),
      mean: 2_000_000, // 0.002s
      max: 500_000_000, // 0.5s
    };
    (monitorEventLoopDelay as jest.Mock).mockReturnValue(histogram);
    (performance.eventLoopUtilization as jest.Mock).mockImplementation(
      (first?: unknown, second?: unknown) =>
        first && second
          ? { idle: 0, active: 0, utilization: 0.42 }
          : { idle: 1, active: 1, utilization: 0 },
    );

    const metricsService = {
      createMultiObservableGauge: jest.fn(
        ({ callback }: { callback: MultiGaugeCallback }) => {
          delayCallback = callback;
        },
      ),
      createObservableGauge: jest.fn(
        ({ callback }: { callback: GaugeCallback }) => {
          utilizationCallback = callback;
        },
      ),
    } as unknown as MetricsService;

    const service = new EventLoopMetricsService(metricsService);

    service.onModuleInit();
  });

  it('enables the delay histogram on init', () => {
    expect(histogram.enable).toHaveBeenCalledTimes(1);
  });

  it('reports event loop delay quantiles in seconds and resets the histogram', async () => {
    const observations = await delayCallback();

    expect(observations).toEqual([
      { value: 0.002, attributes: { quantile: 'mean' } },
      { value: 0.001, attributes: { quantile: 'p50' } },
      { value: 0.01, attributes: { quantile: 'p99' } },
      { value: 0.5, attributes: { quantile: 'max' } },
    ]);
    expect(histogram.reset).toHaveBeenCalledTimes(1);
  });

  it('reports event loop utilization as the delta since the previous scrape', async () => {
    expect(await utilizationCallback()).toBe(0.42);
  });
});
