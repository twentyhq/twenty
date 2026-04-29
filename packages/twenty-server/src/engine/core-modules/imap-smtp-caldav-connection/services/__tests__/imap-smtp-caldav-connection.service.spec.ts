import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { ImapSmtpCaldavService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection.service';
import { type ConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

jest.mock(
  'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/caldav.client',
  () => ({
    CalDAVClient: jest.fn().mockImplementation(() => ({
      listCalendars: jest.fn().mockResolvedValue([]),
      validateSyncCollectionSupport: jest.fn().mockResolvedValue(undefined),
    })),
  }),
);

import { CalDAVClient } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/caldav.client';

const MockCalDAVClient = jest.mocked(CalDAVClient);

describe('ImapSmtpCaldavService', () => {
  let service: ImapSmtpCaldavService;

  const mockSsrfSafeFetch = jest.fn();

  const mockSecureHttpClientService = {
    createSsrfSafeFetch: jest.fn().mockReturnValue(mockSsrfSafeFetch),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSecureHttpClientService.createSsrfSafeFetch.mockReturnValue(
      mockSsrfSafeFetch,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapSmtpCaldavService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {},
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: {},
        },
        {
          provide: SecureHttpClientService,
          useValue: mockSecureHttpClientService,
        },
      ],
    }).compile();

    service = module.get<ImapSmtpCaldavService>(ImapSmtpCaldavService);
  });

  describe('testCaldavConnection', () => {
    it('should pass SSRF-safe fetch to CalDAVClient', async () => {
      const params: ConnectionParameters = {
        host: 'https://caldav.example.com',
        port: 443,
        username: 'user@example.com',
        password: 'password123',
      };

      await service.testCaldavConnection('user@example.com', params);

      expect(
        mockSecureHttpClientService.createSsrfSafeFetch,
      ).toHaveBeenCalledTimes(1);
      expect(MockCalDAVClient).toHaveBeenCalledWith(
        expect.objectContaining({ fetch: mockSsrfSafeFetch }),
      );
    });
  });
});
