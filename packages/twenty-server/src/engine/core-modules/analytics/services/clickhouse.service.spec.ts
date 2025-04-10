import { Test, TestingModule } from '@nestjs/testing';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
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
  let twentyConfigService: TwentyConfigService;
  let exceptionHandlerService: ExceptionHandlerService;
  let mockClickhouseClient: { insert: jest.Mock };

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

    mockClickhouseClient = {
      insert: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClickhouseService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'ANALYTICS_ENABLED') return true;
              if (key === 'CLICKHOUSE_URL') return 'http://localhost:8123';

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
      ],
    }).compile();

    service = module.get<ClickhouseService>(ClickhouseService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    exceptionHandlerService = module.get<ExceptionHandlerService>(
      ExceptionHandlerService,
    );

    // Set the mock client
    // @ts-expect-error accessing private property for testing
    service.clickhouseClient = mockClickhouseClient;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should not initialize clickhouse client when analytics is disabled', async () => {
      jest.spyOn(twentyConfigService, 'get').mockImplementation((key) => {
        if (key === 'ANALYTICS_ENABLED') return false;
      });

      const newModule: TestingModule = await Test.createTestingModule({
        providers: [
          ClickhouseService,
          {
            provide: TwentyConfigService,
            useValue: twentyConfigService,
          },
          {
            provide: ExceptionHandlerService,
            useValue: exceptionHandlerService,
          },
        ],
      }).compile();

      const newService = newModule.get<ClickhouseService>(ClickhouseService);

      // @ts-expect-error accessing private property for testing
      expect(newService.clickhouseClient).toBeUndefined();
    });
  });

  describe('pushEvent', () => {
    it('should insert event into clickhouse and return success', async () => {
      const result = await service.pushEvent(mockEvent);

      expect(result).toEqual({ success: true });
      expect(mockClickhouseClient.insert).toHaveBeenCalledWith({
        table: 'events',
        values: [
          {
            ...mockEvent,
            payload: JSON.stringify(mockEvent.payload),
          },
        ],
        format: 'JSONEachRow',
      });
    });

    it('should insert pageview into clickhouse and return success', async () => {
      const result = await service.pushEvent(mockPageview);

      expect(result).toEqual({ success: true });
      expect(mockClickhouseClient.insert).toHaveBeenCalledWith({
        table: 'pageview',
        values: [mockPageview],
        format: 'JSONEachRow',
      });
    });

    it('should return success when clickhouse client is not defined', async () => {
      // @ts-expect-error accessing private property for testing
      service.clickhouseClient = undefined;

      const result = await service.pushEvent(mockEvent);

      expect(result).toEqual({ success: true });
    });

    it('should handle errors and return failure', async () => {
      const testError = new Error('Test error');

      mockClickhouseClient.insert.mockRejectedValueOnce(testError);

      const result = await service.pushEvent(mockEvent);

      expect(result).toEqual({ success: false });
      expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledWith([
        testError,
      ]);
    });
  });
});
