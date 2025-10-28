import { Test, type TestingModule } from '@nestjs/testing';

import { AuditContextMock } from 'test/utils/audit-context.mock';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { OBJECT_RECORD_CREATED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-created';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-activated';
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

      expect(context).toHaveProperty('insertWorkspaceEvent');
      expect(context).toHaveProperty('createObjectEvent');
      expect(context).toHaveProperty('createPageviewEvent');
    });

    it('should call insertWorkspaceEvent with correct parameters', async () => {
      const insertWorkspaceEventSpy = jest
        .fn()
        .mockResolvedValue({ success: true });
      const mockContext = AuditContextMock({
        insertWorkspaceEvent: insertWorkspaceEventSpy,
      });

      jest.spyOn(service, 'createContext').mockReturnValue(mockContext);

      const context = service.createContext(mockUserIdAndWorkspaceId);

      await context.insertWorkspaceEvent(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});

      expect(insertWorkspaceEventSpy).toHaveBeenCalledWith(
        CUSTOM_DOMAIN_ACTIVATED_EVENT,
        {},
      );
    });

    it('should call createPageviewEvent with correct parameters', async () => {
      const createPageviewEventSpy = jest
        .fn()
        .mockResolvedValue({ success: true });
      const mockContext = AuditContextMock({
        createPageviewEvent: createPageviewEventSpy,
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

      await context.createPageviewEvent('page-view', testPageviewProperties);

      expect(createPageviewEventSpy).toHaveBeenCalledWith(
        'page-view',
        testPageviewProperties,
      );
    });

    it('should return success when insertWorkspaceEvent is called', async () => {
      const context = service.createContext(mockUserIdAndWorkspaceId);

      const result = await context.insertWorkspaceEvent(
        CUSTOM_DOMAIN_ACTIVATED_EVENT,
        {},
      );

      expect(result).toEqual({ success: true });
    });

    it('should return success when createPageviewEvent is called', async () => {
      const context = service.createContext(mockUserIdAndWorkspaceId);

      const result = await context.createPageviewEvent('page-view', {});

      expect(result).toEqual({ success: true });
    });

    it('should return success when createObjectEvent is called', async () => {
      const context = service.createContext(mockUserIdAndWorkspaceId);

      const result = await context.createObjectEvent(
        OBJECT_RECORD_CREATED_EVENT,
        {
          recordId: 'test-record-id',
          objectMetadataId: 'test-object-metadata-id',
        },
      );

      expect(result).toEqual({ success: true });
    });
  });
});
