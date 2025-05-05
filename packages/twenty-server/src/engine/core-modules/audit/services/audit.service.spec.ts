import { Test, TestingModule } from '@nestjs/testing';

import { AuditContextMock } from 'test/utils/audit-context.mock';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/track/custom-domain/custom-domain-activated';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuditService,
          useValue: {
            createContext: AuditContextMock,
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: ClickHouseService,
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

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createContext', () => {
    const mockUserIdAndWorkspaceId = {
      userId: 'test-user-id',
      workspaceId: 'test-workspace-id',
    };

    it('should create a valid context object', () => {
      const context = service.createContext(mockUserIdAndWorkspaceId);

      expect(context).toHaveProperty('track');
      expect(context).toHaveProperty('pageview');
    });

    it('should call track with correct parameters', async () => {
      const trackSpy = jest.fn().mockResolvedValue({ success: true });
      const mockContext = AuditContextMock({
        track: trackSpy,
      });

      jest.spyOn(service, 'createContext').mockReturnValue(mockContext);

      const context = service.createContext(mockUserIdAndWorkspaceId);

      await context.track(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});

      expect(trackSpy).toHaveBeenCalledWith(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});
    });

    it('should call pageview with correct parameters', async () => {
      const pageviewSpy = jest.fn().mockResolvedValue({ success: true });
      const mockContext = AuditContextMock({
        pageview: pageviewSpy,
      });

      jest.spyOn(service, 'createContext').mockReturnValue(mockContext);

      const context = service.createContext(mockUserIdAndWorkspaceId);
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
      const context = service.createContext(mockUserIdAndWorkspaceId);

      const result = await context.track(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});

      expect(result).toEqual({ success: true });
    });

    it('should return success when pageview is called', async () => {
      const context = service.createContext(mockUserIdAndWorkspaceId);

      const result = await context.pageview('page-view', {});

      expect(result).toEqual({ success: true });
    });
  });
});
