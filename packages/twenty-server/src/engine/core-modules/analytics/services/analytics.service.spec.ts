import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ClickhouseService } from 'src/engine/core-modules/analytics/services/clickhouse.service';
import { AnalyticsPageview } from 'src/engine/core-modules/analytics/types/pageview.type';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';

import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let environmentService: EnvironmentService;
  let clickhouseService: ClickhouseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: ClickhouseService,
          useValue: {
            pushEvent: jest.fn(),
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

    service = module.get<AnalyticsService>(AnalyticsService);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
    clickhouseService = module.get<ClickhouseService>(ClickhouseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAnalyticsContext', () => {
    const mockUserIdAndWorkspaceId = {
      userId: 'test-user-id',
      workspaceId: 'test-workspace-id',
    };
    const commonProperties = {
      version: '1',
      timestamp: new Date().getTime().toString(),
    };

    it('should create a valid context object', () => {
      const context = service.createAnalyticsContext(mockUserIdAndWorkspaceId);

      expect(context).toHaveProperty('sendUnknownEvent');
      expect(context).toHaveProperty('sendEvent');
      expect(context).toHaveProperty('sendPageview');
    });

    it('should call sendEvent with merged properties', async () => {
      const insertSpy = jest.spyOn(clickhouseService, 'pushEvent');
      const context = service.createAnalyticsContext(mockUserIdAndWorkspaceId);

      const testEvent = {
        action: 'customDomain.activated' as const,
      };

      await context.sendEvent(testEvent);

      expect(insertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...testEvent,
          ...mockUserIdAndWorkspaceId,
          timestamp: expect.any(String),
          payload: {},
        }),
      );
    });

    it('should call sendPageview with merged properties', async () => {
      const insertSpy = jest.spyOn(clickhouseService, 'pushEvent');

      const context = service.createAnalyticsContext(mockUserIdAndWorkspaceId);
      const testPageview: AnalyticsPageview = {
        href: '/test-url',
        timestamp: Date.now().toString(),
        version: '1',
        locale: '',
        pathname: '',
        referrer: '',
        sessionId: '',
        timeZone: '',
        userAgent: '',
      };

      await context.sendPageview(testPageview);

      expect(insertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...testPageview,
          ...commonProperties,
          ...mockUserIdAndWorkspaceId,
          timestamp: expect.any(String),
        }),
      );
    });

    it('should return success when analytics are disabled', async () => {
      jest.spyOn(environmentService, 'get').mockReturnValue(false);
      // @ts-expect-error private function trigger an inaccurate error
      const sendEventSpy = jest.spyOn(service, 'sendEvent');

      const context = service.createAnalyticsContext(mockUserIdAndWorkspaceId);

      const result = await context.sendEvent({
        action: 'customDomain.activated',
      });

      expect(result).toEqual({ success: true });
      expect(sendEventSpy).not.toHaveBeenCalled();
    });

    it('should handle null userId and workspaceId correctly', async () => {
      const insertSpy = jest.spyOn(clickhouseService, 'pushEvent');

      const context = service.createAnalyticsContext();
      const testEvent = {
        action: 'customDomain.activated' as const,
      };

      await context.sendEvent(testEvent);

      expect(insertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...testEvent,
          timestamp: expect.any(String),
          payload: {},
        }),
      );
    });
  });
});
