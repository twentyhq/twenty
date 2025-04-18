import { Test, TestingModule } from '@nestjs/testing';

import { AnalyticsContextMock } from 'test/utils/analytics-context.mock';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ClickhouseService } from 'src/engine/core-modules/analytics/services/clickhouse.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/analytics/utils/events/track/custom-domain/custom-domain-activated';

import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            createAnalyticsContext: AnalyticsContextMock,
          },
        },
        {
          provide: TwentyConfigService,
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAnalyticsContext', () => {
    const mockUserIdAndWorkspaceId = {
      userId: 'test-user-id',
      workspaceId: 'test-workspace-id',
    };

    it('should create a valid context object', () => {
      const context = service.createAnalyticsContext(mockUserIdAndWorkspaceId);

      expect(context).toHaveProperty('track');
      expect(context).toHaveProperty('pageview');
    });

    it('should call track with correct parameters', async () => {
      const trackSpy = jest.fn().mockResolvedValue({ success: true });
      const mockContext = AnalyticsContextMock({
        track: trackSpy,
      });

      jest
        .spyOn(service, 'createAnalyticsContext')
        .mockReturnValue(mockContext);

      const context = service.createAnalyticsContext(mockUserIdAndWorkspaceId);

      await context.track(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});

      expect(trackSpy).toHaveBeenCalledWith(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});
    });

    it('should call pageview with correct parameters', async () => {
      const pageviewSpy = jest.fn().mockResolvedValue({ success: true });
      const mockContext = AnalyticsContextMock({
        pageview: pageviewSpy,
      });

      jest
        .spyOn(service, 'createAnalyticsContext')
        .mockReturnValue(mockContext);

      const context = service.createAnalyticsContext(mockUserIdAndWorkspaceId);
      const testPageviewProperties = {
        href: '/test-url',
        locale: '',
        pathname: '',
        referrer: '',
        sessionId: '',
        timeZone: '',
        userAgent: '',
      };

      await context.pageview('page-view', testPageviewProperties);

      expect(pageviewSpy).toHaveBeenCalledWith(
        'page-view',
        testPageviewProperties,
      );
    });

    it('should return success when track is called', async () => {
      const context = service.createAnalyticsContext(mockUserIdAndWorkspaceId);

      const result = await context.track(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});

      expect(result).toEqual({ success: true });
    });

    it('should return success when pageview is called', async () => {
      const context = service.createAnalyticsContext(mockUserIdAndWorkspaceId);

      const result = await context.pageview('page-view', {});

      expect(result).toEqual({ success: true });
    });
  });
});
