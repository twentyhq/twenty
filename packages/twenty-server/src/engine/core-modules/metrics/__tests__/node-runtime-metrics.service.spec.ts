import {
  monitorEventLoopDelay,
  performance,
  PerformanceObserver,
  type PerformanceObserverCallback,
} from 'node:perf_hooks';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { NodeRuntimeMetricsService } from 'src/engine/core-modules/metrics/node-runtime-metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

jest.mock('node:perf_hooks', () => ({
  constants: {
    NODE_PERFORMANCE_GC_MINOR: 1,
    NODE_PERFORMANCE_GC_MAJOR: 4,
    NODE_PERFORMANCE_GC_INCREMENTAL: 8,
    NODE_PERFORMANCE_GC_WEAKCB: 16,
  },
  monitorEventLoopDelay: jest.fn(),
  performance: {
    eventLoopUtilization: jest.fn(),
  },
  PerformanceObserver: jest.fn(),
}));

describe('NodeRuntimeMetricsService', () => {
  const garbageCollectionDurationRecord = jest.fn();
  const eventLoopDelayMonitor = {
    count: 3,
    percentile: jest.fn((percentile: number) =>
      percentile === 50 ? 15_000_000 : 110_000_000,
    ),
    max: 510_000_000,
    enable: jest.fn(),
    disable: jest.fn(),
    reset: jest.fn(),
  };
  const garbageCollectionObserver = {
    observe: jest.fn(),
    disconnect: jest.fn(),
  };

  let metricsService: jest.Mocked<MetricsService>;
  let twentyConfigService: jest.Mocked<TwentyConfigService>;
  let service: NodeRuntimeMetricsService;
  let performanceObserverCallback: PerformanceObserverCallback;

  beforeEach(() => {
    jest.mocked(performance.eventLoopUtilization).mockReset();
    jest.spyOn(process, 'memoryUsage').mockReturnValue({
      rss: 2_000,
      heapTotal: 1_000,
      heapUsed: 600,
      external: 300,
      arrayBuffers: 200,
    });

    metricsService = {
      createMultiObservableGauge: jest.fn(),
      createObservableGauge: jest.fn(),
      getMeter: jest.fn().mockReturnValue({
        createHistogram: jest.fn().mockReturnValue({
          record: garbageCollectionDurationRecord,
        }),
      }),
    } as unknown as jest.Mocked<MetricsService>;
    twentyConfigService = {
      get: jest.fn().mockReturnValue(['prometheus']),
    } as unknown as jest.Mocked<TwentyConfigService>;

    jest
      .mocked(monitorEventLoopDelay)
      .mockReturnValue(eventLoopDelayMonitor as never);
    jest
      .mocked(performance.eventLoopUtilization)
      .mockReturnValueOnce({ idle: 10, active: 5, utilization: 1 / 3 })
      .mockReturnValueOnce({ idle: 15, active: 20, utilization: 4 / 7 })
      .mockReturnValueOnce({ idle: 5, active: 15, utilization: 0.75 });
    jest
      .mocked(PerformanceObserver)
      .mockImplementation((callback: PerformanceObserverCallback) => {
        performanceObserverCallback = callback;

        return garbageCollectionObserver as never;
      });

    service = new NodeRuntimeMetricsService(
      metricsService,
      twentyConfigService,
    );
    service.onModuleInit();
  });

  afterEach(() => {
    service.onModuleDestroy();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('publishes event loop delay and utilization snapshots', async () => {
    jest.advanceTimersByTime(30_000);

    const delayGauge =
      metricsService.createMultiObservableGauge.mock.calls.find(
        ([options]) =>
          options.metricName === 'twenty_nodejs_event_loop_delay_seconds',
      )?.[0];
    const utilizationGauge =
      metricsService.createObservableGauge.mock.calls.find(
        ([options]) =>
          options.metricName === 'twenty_nodejs_event_loop_utilization',
      )?.[0];
    const heapSizeGauge =
      metricsService.createMultiObservableGauge.mock.calls.find(
        ([options]) => options.metricName === 'twenty_nodejs_heap_size_bytes',
      )?.[0];

    expect(await delayGauge?.callback()).toEqual([
      { value: 0.005, attributes: { statistic: 'p50' } },
      { value: 0.1, attributes: { statistic: 'p99' } },
      { value: 0.5, attributes: { statistic: 'max' } },
    ]);
    expect(await utilizationGauge?.callback()).toBe(0.75);
    expect(await heapSizeGauge?.callback()).toEqual([
      { value: 600, attributes: { state: 'used' } },
      { value: 400, attributes: { state: 'unused' } },
    ]);
    expect(eventLoopDelayMonitor.reset).toHaveBeenCalledTimes(1);
  });

  it('records garbage collection duration by bounded kind', () => {
    performanceObserverCallback(
      {
        getEntries: () => [
          {
            duration: 42,
            detail: { kind: 4 },
          },
        ],
      } as never,
      garbageCollectionObserver as never,
    );

    expect(garbageCollectionDurationRecord).toHaveBeenCalledWith(42, {
      kind: 'major',
    });
  });

  it('stops collecting runtime metrics on module destroy', () => {
    service.onModuleDestroy();
    jest.advanceTimersByTime(30_000);

    expect(eventLoopDelayMonitor.reset).not.toHaveBeenCalled();
    expect(eventLoopDelayMonitor.disable).toHaveBeenCalledTimes(1);
    expect(garbageCollectionObserver.disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not collect runtime metrics when meter drivers are disabled', () => {
    service.onModuleDestroy();
    jest.clearAllMocks();
    twentyConfigService.get.mockReturnValue([]);

    service = new NodeRuntimeMetricsService(
      metricsService,
      twentyConfigService,
    );
    service.onModuleInit();

    expect(monitorEventLoopDelay).not.toHaveBeenCalled();
    expect(PerformanceObserver).not.toHaveBeenCalled();
    expect(metricsService.getMeter).not.toHaveBeenCalled();
  });
});
