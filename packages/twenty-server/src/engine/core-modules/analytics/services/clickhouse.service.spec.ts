import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { AnalyticsPageview } from 'src/engine/core-modules/analytics/types/pageview.type';
import { AnalyticsEvent } from 'src/engine/core-modules/analytics/types/event.type';

import { ClickhouseService } from './clickhouse.service';

// Mock the createClient function from @clickhouse/client
jest.mock('@clickhouse/client', () => ({
  createClient: jest.fn().mockReturnValue({
    insert: jest.fn().mockResolvedValue({}),
  }),
}));

describe('ClickhouseService', () => {
  let service: ClickhouseService;
  let environmentService: EnvironmentService;
  let exceptionHandlerService: ExceptionHandlerService;
  let schedulerRegistry: SchedulerRegistry;

  const mockPageview: AnalyticsPageview = {
    href: 'https://example.com/test',
    locale: 'en-US',
    pathname: '/test',
    referrer: 'https://example.com',
    sessionId: 'test-session-id',
    timeZone: 'UTC',
    timestamp: new Date().toISOString(),
    userAgent: 'test-user-agent',
    version: '1.0.0',
    userId: 'test-user-id',
    workspaceId: 'test-workspace-id',
  };

  const mockEvent: AnalyticsEvent = {
    action: 'test.action',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    userId: 'test-user-id',
    workspaceId: 'test-workspace-id',
    payload: { test: 'data' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClickhouseService,
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'ANALYTICS_ENABLED') return true;
              if (key === 'CLICKHOUSE_URL') return 'http://localhost:8123';
              if (key === 'ANALYTICS_FLUSH_INTERVAL_MS') return 5000;

              return null;
            }),
          },
        },
        {
          provide: ExceptionHandlerService,
          useValue: {
            captureExceptions: jest.fn(),
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addInterval: jest.fn(),
            doesExist: jest.fn(),
            deleteInterval: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClickhouseService>(ClickhouseService);
    environmentService = module.get<EnvironmentService>(EnvironmentService);

    exceptionHandlerService = module.get<ExceptionHandlerService>(
      ExceptionHandlerService,
    );
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should not initialize clickhouse client when analytics is disabled', async () => {
      jest.spyOn(environmentService, 'get').mockImplementation((key) => {
        if (key === 'ANALYTICS_ENABLED') return false;
      });

      const newModule: TestingModule = await Test.createTestingModule({
        providers: [
          ClickhouseService,
          {
            provide: EnvironmentService,
            useValue: environmentService,
          },
          {
            provide: ExceptionHandlerService,
            useValue: exceptionHandlerService,
          },
          {
            provide: SchedulerRegistry,
            useValue: schedulerRegistry,
          },
        ],
      }).compile();

      const newService = newModule.get<ClickhouseService>(ClickhouseService);

      // @ts-expect-error accessing private property for testing
      expect(newService.clickhouseClient).toBeUndefined();
    });
  });

  describe('onModuleInit', () => {
    it('should set up interval when analytics is enabled', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      service.onModuleInit();

      expect(setIntervalSpy).toHaveBeenCalled();
      expect(schedulerRegistry.addInterval).toHaveBeenCalledWith(
        'event-buffer-flush',
        expect.any(Object),
      );
    });

    it('should not set up interval when analytics is disabled', () => {
      jest.spyOn(environmentService, 'get').mockReturnValue(false);
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      service.onModuleInit();

      expect(setIntervalSpy).not.toHaveBeenCalled();
      expect(schedulerRegistry.addInterval).not.toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should flush buffer and clean up interval', async () => {
      // @ts-expect-error accessing private method for testing
      const flushSpy = jest.spyOn(service, 'flush');

      jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(true);

      await service.onModuleDestroy();

      expect(flushSpy).toHaveBeenCalledWith(true);
      expect(schedulerRegistry.doesExist).toHaveBeenCalledWith(
        'interval',
        'event-buffer-flush',
      );
      expect(schedulerRegistry.deleteInterval).toHaveBeenCalledWith(
        'event-buffer-flush',
      );
    });

    it('should not delete interval if it does not exist', async () => {
      jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(false);

      await service.onModuleDestroy();

      expect(schedulerRegistry.deleteInterval).not.toHaveBeenCalled();
    });
  });

  describe('pushEvent', () => {
    it('should add event to buffer and return success', async () => {
      const result = await service.pushEvent(mockEvent);

      expect(result).toEqual({ success: true });
      // @ts-expect-error accessing private property for testing
      expect(service.buffer).toContain(mockEvent);
    });

    it('should add pageview to buffer and return success', async () => {
      const result = await service.pushEvent(mockPageview);

      expect(result).toEqual({ success: true });
      // @ts-expect-error accessing private property for testing
      expect(service.buffer).toContain(mockPageview);
    });

    it('should flush buffer when it reaches maxBufferSize', async () => {
      // @ts-expect-error accessing private method for testing
      const flushSpy = jest.spyOn(service, 'flush');

      // Fill the buffer to maxBufferSize
      for (let i = 0; i < 100; i++) {
        await service.pushEvent({
          ...mockEvent,
          timestamp: new Date().toISOString(),
        });
      }

      expect(flushSpy).toHaveBeenCalled();
    });

    it('should handle errors and return failure', async () => {
      // @ts-expect-error accessing private property for testing
      service.buffer = null; // Force an error

      const result = await service.pushEvent(mockEvent);

      expect(result).toEqual({ success: false });
      expect(exceptionHandlerService.captureExceptions).toHaveBeenCalled();
    });
  });

  describe('private methods', () => {
    describe('bulkInsert', () => {
      it('should insert events into clickhouse', async () => {
        const clickhouseClient = {
          insert: jest.fn().mockResolvedValue({}),
        };

        // @ts-expect-error accessing private property for testing
        service.clickhouseClient = clickhouseClient;

        // @ts-expect-error accessing private method for testing
        const result = await service.bulkInsert([mockEvent]);

        expect(result).toEqual({ success: true });
        expect(clickhouseClient.insert).toHaveBeenCalledWith({
          table: 'events',
          values: [
            expect.objectContaining({
              ...mockEvent,
              payload: JSON.stringify(mockEvent.payload),
            }),
          ],
          format: 'JSONEachRow',
        });
      });

      it('should insert pageviews into clickhouse', async () => {
        const clickhouseClient = {
          insert: jest.fn().mockResolvedValue({}),
        };

        // @ts-expect-error accessing private property for testing
        service.clickhouseClient = clickhouseClient;

        // @ts-expect-error accessing private method for testing
        const result = await service.bulkInsert([mockPageview]);

        expect(result).toEqual({ success: true });
        expect(clickhouseClient.insert).toHaveBeenCalledWith({
          table: 'pageview',
          values: [mockPageview],
          format: 'JSONEachRow',
        });
      });

      it('should handle mixed event types', async () => {
        const clickhouseClient = {
          insert: jest.fn().mockResolvedValue({}),
        };

        // @ts-expect-error accessing private property for testing
        service.clickhouseClient = clickhouseClient;

        // @ts-expect-error accessing private method for testing
        const result = await service.bulkInsert([mockEvent, mockPageview]);

        expect(result).toEqual({ success: true });
        expect(clickhouseClient.insert).toHaveBeenCalledTimes(2);
      });

      it('should return success when clickhouse client is not defined', async () => {
        // @ts-expect-error accessing private property for testing
        service.clickhouseClient = undefined;

        // @ts-expect-error accessing private method for testing
        const result = await service.bulkInsert([mockEvent]);

        expect(result).toEqual({ success: true });
      });

      it('should handle errors and return failure', async () => {
        const clickhouseClient = {
          insert: jest.fn().mockRejectedValue(new Error('Test error')),
        };

        // @ts-expect-error accessing private property for testing
        service.clickhouseClient = clickhouseClient;

        // @ts-expect-error accessing private method for testing
        const result = await service.bulkInsert([mockEvent]);

        expect(result).toEqual({ success: false });
        expect(exceptionHandlerService.captureExceptions).toHaveBeenCalled();
      });
    });

    describe('flush', () => {
      it('should not flush when buffer is empty', async () => {
        // @ts-expect-error accessing private method for testing
        const bulkInsertSpy = jest.spyOn(service, 'bulkInsert');

        // @ts-expect-error accessing private property for testing
        service.buffer = [];

        // @ts-expect-error accessing private method for testing
        await service.flush();

        expect(bulkInsertSpy).not.toHaveBeenCalled();
      });

      it('should not flush when already flushing', async () => {
        // @ts-expect-error accessing private method for testing
        const bulkInsertSpy = jest.spyOn(service, 'bulkInsert');

        // @ts-expect-error accessing private property for testing
        service.buffer = [mockEvent];
        // @ts-expect-error accessing private property for testing
        service.flushing = true;

        // @ts-expect-error accessing private method for testing
        await service.flush();

        expect(bulkInsertSpy).not.toHaveBeenCalled();
      });

      it('should flush when force is true even if buffer is empty', async () => {
        const bulkInsertSpy = jest
          // @ts-expect-error accessing private method for testing
          .spyOn(service, 'bulkInsert')
          // @ts-expect-error accessing private method for testing
          .mockResolvedValue({ success: true });

        // @ts-expect-error accessing private property for testing
        service.buffer = [];

        // @ts-expect-error accessing private method for testing
        await service.flush(true);

        expect(bulkInsertSpy).toHaveBeenCalled();
      });

      it('should flush buffer and call bulkInsert', async () => {
        const bulkInsertSpy = jest
          // @ts-expect-error accessing private method for testing
          .spyOn(service, 'bulkInsert')
          // @ts-expect-error accessing private method for testing
          .mockResolvedValue({ success: true });

        // @ts-expect-error accessing private property for testing
        service.buffer = [mockEvent];

        // @ts-expect-error accessing private method for testing
        await service.flush();

        expect(bulkInsertSpy).toHaveBeenCalledWith([mockEvent]);
        // @ts-expect-error accessing private property for testing
        expect(service.buffer).toEqual([]);
      });
    });
  });
});
