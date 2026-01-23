import { Test, type TestingModule } from '@nestjs/testing';

import { PrometheusService } from './prometheus.service';

describe('PrometheusService', () => {
  let service: PrometheusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrometheusService],
    }).compile();

    service = module.get<PrometheusService>(PrometheusService);
    service.onModuleInit();
  });

  describe('createGauge', () => {
    it('should create a gauge and return metrics', async () => {
      const gauge = service.createGauge({
        name: 'test_gauge',
        help: 'Test gauge',
      });

      gauge.set(42);

      const metrics = await service.getMetrics();

      expect(metrics).toContain('test_gauge 42');
    });

    it('should call collect callback when metrics are scraped', async () => {
      const collectFn = jest.fn((gauge) => gauge.set(100));

      service.createGauge({
        name: 'test_collect_gauge',
        help: 'Test collect',
        collect: collectFn,
      });

      await service.getMetrics();

      expect(collectFn).toHaveBeenCalled();
    });

    it('should handle async collect callback', async () => {
      service.createGauge({
        name: 'test_async_gauge',
        help: 'Test async',
        collect: async (gauge) => {
          await Promise.resolve();
          gauge.set(200);
        },
      });

      const metrics = await service.getMetrics();

      expect(metrics).toContain('test_async_gauge 200');
    });

    it('should propagate collect callback errors', async () => {
      service.createGauge({
        name: 'test_error_gauge',
        help: 'Test error',
        collect: async () => {
          throw new Error('Collection failed');
        },
      });

      await expect(service.getMetrics()).rejects.toThrow('Collection failed');
    });
  });

  describe('getContentType', () => {
    it('should return prometheus content type', () => {
      expect(service.getContentType()).toContain('text/plain');
    });
  });

  describe('getMetrics', () => {
    it('should include default node metrics', async () => {
      const metrics = await service.getMetrics();

      expect(metrics).toContain('nodejs_');
    });
  });
});
