import * as dns from 'dns/promises';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ImapSmtpCaldavValidatorService } from 'src/engine/core-modules/imap-smtp-caldav-connection/services/imap-smtp-caldav-connection-validator.service';
import { type ConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';

jest.mock('dns/promises', () => ({
  lookup: jest.fn(),
}));

const mockedDnsLookup = dns.lookup as jest.MockedFunction<typeof dns.lookup>;

const buildValidParams = (
  overrides: Partial<ConnectionParameters> = {},
): ConnectionParameters => ({
  host: 'mail.example.com',
  port: 993,
  password: 'secret',
  ...overrides,
});

describe('ImapSmtpCaldavValidatorService', () => {
  let service: ImapSmtpCaldavValidatorService;

  beforeEach(() => {
    service = new ImapSmtpCaldavValidatorService();
    jest.clearAllMocks();
  });

  describe('validateProtocolConnectionParams', () => {
    it('should reject missing params', async () => {
      await expect(
        service.validateProtocolConnectionParams(
          null as unknown as ConnectionParameters,
        ),
      ).rejects.toThrow(UserInputError);
    });

    it('should reject params that fail schema validation', async () => {
      await expect(
        service.validateProtocolConnectionParams({
          host: '',
          port: -1,
          password: '',
        } as ConnectionParameters),
      ).rejects.toThrow(UserInputError);
    });

    it('should resolve hostname via DNS and accept public IP', async () => {
      mockedDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const params = buildValidParams();
      const result = await service.validateProtocolConnectionParams(params);

      expect(result).toEqual(params);
      expect(mockedDnsLookup).toHaveBeenCalledWith('mail.example.com');
    });

    it('should skip DNS when host is already an IP', async () => {
      const params = buildValidParams({ host: '93.184.216.34' });

      const result = await service.validateProtocolConnectionParams(params);

      expect(result).toEqual(params);
      expect(mockedDnsLookup).not.toHaveBeenCalled();
    });

    it('should strip protocol prefix before resolving', async () => {
      mockedDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const params = buildValidParams({ host: 'https://mail.example.com' });

      await service.validateProtocolConnectionParams(params);

      expect(mockedDnsLookup).toHaveBeenCalledWith('mail.example.com');
    });

    it('should extract hostname from CalDAV URL with path', async () => {
      mockedDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const params = buildValidParams({
        host: 'caldav.example.com/remote.php/dav/principals/',
      });

      await service.validateProtocolConnectionParams(params);

      expect(mockedDnsLookup).toHaveBeenCalledWith('caldav.example.com');
    });

    it('should extract hostname from host with port but no protocol', async () => {
      mockedDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const params = buildValidParams({
        host: 'caldav.example.com:8443',
      });

      await service.validateProtocolConnectionParams(params);

      expect(mockedDnsLookup).toHaveBeenCalledWith('caldav.example.com');
    });

    it('should extract hostname from full CalDAV URL with port and path', async () => {
      mockedDnsLookup.mockResolvedValue({
        address: '93.184.216.34',
        family: 4,
      });

      const params = buildValidParams({
        host: 'https://caldav.example.com:8443/remote.php/dav/',
      });

      await service.validateProtocolConnectionParams(params);

      expect(mockedDnsLookup).toHaveBeenCalledWith('caldav.example.com');
    });

    it('should block private IP hidden in CalDAV URL with path', async () => {
      mockedDnsLookup.mockResolvedValue({
        address: '192.168.1.100',
        family: 4,
      });

      const params = buildValidParams({
        host: 'internal.local/remote.php/dav/',
      });

      await expect(
        service.validateProtocolConnectionParams(params),
      ).rejects.toThrow(UserInputError);
    });

    it('should reject hostname that resolves to a private IP', async () => {
      mockedDnsLookup.mockResolvedValue({
        address: '169.254.169.254',
        family: 4,
      });

      const params = buildValidParams({
        host: 'metadata.google.internal',
      });

      await expect(
        service.validateProtocolConnectionParams(params),
      ).rejects.toThrow(UserInputError);
    });

    it('should reject a direct private IP without DNS lookup', async () => {
      const params = buildValidParams({ host: '127.0.0.1' });

      await expect(
        service.validateProtocolConnectionParams(params),
      ).rejects.toThrow(UserInputError);

      expect(mockedDnsLookup).not.toHaveBeenCalled();
    });

    it('should reject unresolvable hostname', async () => {
      mockedDnsLookup.mockRejectedValue(
        new Error('getaddrinfo ENOTFOUND nonexistent.example.com'),
      );

      const params = buildValidParams({ host: 'nonexistent.example.com' });

      await expect(
        service.validateProtocolConnectionParams(params),
      ).rejects.toThrow(UserInputError);
    });
  });
});
