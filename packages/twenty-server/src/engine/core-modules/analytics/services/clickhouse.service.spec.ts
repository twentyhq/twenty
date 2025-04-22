import { Test, TestingModule } from '@nestjs/testing';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/analytics/utils/events/track/custom-domain/custom-domain-activated';
import {
  makePageview,
  makeTrackEvent,
} from 'src/engine/core-modules/analytics/utils/analytics.utils';

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

  const mockPageview = makePageview('Home', {
    href: 'https://example.com/test',
    locale: 'en-US',
    pathname: '/test',
    referrer: 'https://example.com',
    sessionId: 'test-session-id',
    timeZone: 'UTC',
    userAgent: 'test-user-agent',
  });

  const mockEvent = makeTrackEvent(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});

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
      const { type: _type, ...rest } = mockEvent;

      expect(mockClickhouseClient.insert).toHaveBeenCalledWith({
        table: 'events',
        values: [rest],
        format: 'JSONEachRow',
      });
    });

    it('should insert pageview into clickhouse and return success', async () => {
      const result = await service.pushEvent(mockPageview);

      expect(result).toEqual({ success: true });
      const { type: _type, ...rest } = mockPageview;

      expect(mockClickhouseClient.insert).toHaveBeenCalledWith({
        table: 'pageview',
        values: [rest],
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
