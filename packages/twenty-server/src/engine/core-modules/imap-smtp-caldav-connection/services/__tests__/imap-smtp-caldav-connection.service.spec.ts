import { Test, type TestingModule } from '@nestjs/testing';

import { createTransport } from 'nodemailer';
import { type DAVClient } from 'tsdav';

import { ImapSmtpCaldavValidatorService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection-validator.service';
import { ImapSmtpCaldavService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection.service';
import { type ConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CalDavClientService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-client.service';
import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('ImapSmtpCaldavService', () => {
  let service: ImapSmtpCaldavService;

  const mockClient = {} as DAVClient;

  const mockVerify = jest.fn().mockResolvedValue(true);
  const mockGetValidatedHost = jest
    .fn()
    .mockImplementation((host: string) => Promise.resolve(host));

  const mockCalDavClientService = {
    getClient: jest.fn(),
  };

  const mockCalDavFetchEventsService = {
    listEventCalendars: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (createTransport as jest.Mock).mockReturnValue({ verify: mockVerify });
    mockVerify.mockResolvedValue(true);
    mockCalDavClientService.getClient.mockResolvedValue(mockClient);
    mockCalDavFetchEventsService.listEventCalendars.mockResolvedValue([
      { url: 'https://caldav.example.com/calendars/user/default/' },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapSmtpCaldavService,
        {
          provide: SecureHttpClientService,
          useValue: { getValidatedHost: mockGetValidatedHost },
        },
        { provide: ImapSmtpCaldavValidatorService, useValue: {} },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue(true) },
        },
        {
          provide: CalDavClientService,
          useValue: mockCalDavClientService,
        },
        {
          provide: CalDavFetchEventsService,
          useValue: mockCalDavFetchEventsService,
        },
      ],
    }).compile();

    service = module.get<ImapSmtpCaldavService>(ImapSmtpCaldavService);
  });

  describe('testCaldavConnection', () => {
    const params: ConnectionParameters = {
      host: 'https://caldav.example.com',
      port: 443,
      username: 'user@example.com',
      password: 'password123',
      connectionSecurity: 'SSL_TLS',
    };

    it('builds a CalDAV client and lists its event calendars', async () => {
      await service.testCaldavConnection('user@example.com', params);

      expect(mockCalDavClientService.getClient).toHaveBeenCalledWith({
        serverUrl: 'https://caldav.example.com',
        username: 'user@example.com',
        password: 'password123',
      });
      expect(
        mockCalDavFetchEventsService.listEventCalendars,
      ).toHaveBeenCalledWith(mockClient);
    });

    it('falls back to the handle when CALDAV.username is missing', async () => {
      await service.testCaldavConnection('handle@example.com', {
        ...params,
        username: undefined,
      });

      expect(mockCalDavClientService.getClient).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'handle@example.com' }),
      );
    });

    it('throws when no event calendars are found', async () => {
      mockCalDavFetchEventsService.listEventCalendars.mockResolvedValue([]);

      await expect(
        service.testCaldavConnection('user@example.com', params),
      ).rejects.toThrow('No calendar with event support found');
    });
  });

  describe('testSmtpConnection', () => {
    const params: ConnectionParameters = {
      host: 'smtp.example.com',
      port: 587,
      username: 'user@example.com',
      password: 'password123',
      connectionSecurity: 'STARTTLS',
    };

    it('uses implicit TLS when connectionSecurity is SSL_TLS', async () => {
      await service.testSmtpConnection('user@example.com', {
        ...params,
        port: 465,
        connectionSecurity: 'SSL_TLS',
      });

      expect(createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ secure: true }),
      );
    });

    it('requires STARTTLS when connectionSecurity is STARTTLS', async () => {
      await service.testSmtpConnection('user@example.com', {
        ...params,
        connectionSecurity: 'STARTTLS',
      });

      expect(createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ secure: false, requireTLS: true }),
      );
    });

    it('disables TLS when connectionSecurity is NONE', async () => {
      await service.testSmtpConnection('user@example.com', {
        ...params,
        connectionSecurity: 'NONE',
      });

      expect(createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ secure: false, ignoreTLS: true }),
      );
    });
  });
});
