import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import Cloudflare from 'cloudflare';
import { type CustomHostnameCreateResponse } from 'cloudflare/resources/custom-hostnames/custom-hostnames';
import { AuditContextMock } from 'test/utils/audit-context.mock';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { DnsManagerException } from 'src/engine/core-modules/dns-manager/exceptions/dns-manager.exception';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

jest.mock('cloudflare');

describe('DnsManagerService', () => {
  let dnsManagerService: DnsManagerService;
  let twentyConfigService: TwentyConfigService;
  let domainServerConfigService: DomainServerConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DnsManagerService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            createContext: AuditContextMock,
          },
        },
        {
          provide: DomainServerConfigService,
          useValue: {
            getBaseUrl: jest.fn(),
            getPublicDomainUrl: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    dnsManagerService = module.get<DnsManagerService>(DnsManagerService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    domainServerConfigService = module.get<DomainServerConfigService>(
      DomainServerConfigService,
    );

    (dnsManagerService as any).cloudflareClient = {
      customHostnames: {
        list: jest.fn(),
        create: jest.fn(),
      },
    };

    jest.clearAllMocks();
  });

  it('should initialize cloudflareClient when CLOUDFLARE_API_KEY is defined', () => {
    const mockApiKey = 'test-api-key';

    jest.spyOn(twentyConfigService, 'get').mockReturnValue(mockApiKey);

    const instance = new DnsManagerService(twentyConfigService, {} as any);

    expect(twentyConfigService.get).toHaveBeenCalledWith('CLOUDFLARE_API_KEY');
    expect(Cloudflare).toHaveBeenCalledWith({ apiToken: mockApiKey });
    expect(instance.cloudflareClient).toBeDefined();
  });

  describe('registerHostname', () => {
    it('should throw an error when the hostname is already registered', async () => {
      const customDomain = 'example.com';

      jest
        .spyOn(dnsManagerService, 'getHostnameId')
        .mockResolvedValueOnce('hostname-id');

      await expect(
        dnsManagerService.registerHostname(customDomain),
      ).rejects.toThrow(DnsManagerException);

      expect(dnsManagerService.getHostnameId).toHaveBeenCalledWith(
        customDomain,
        undefined,
      );
    });

    it('should register a custom domain successfully', async () => {
      const customDomain = 'example.com';
      const createMock = jest.fn().mockResolvedValueOnce({});
      const cloudflareMock = {
        customHostnames: {
          create: createMock,
        },
      };

      jest
        .spyOn(dnsManagerService, 'getHostnameId')
        .mockResolvedValueOnce(undefined);

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');
      (dnsManagerService as any).cloudflareClient = cloudflareMock;

      await dnsManagerService.registerHostname(customDomain);

      expect(createMock).toHaveBeenCalledWith({
        zone_id: 'test-zone-id',
        hostname: customDomain,
        ssl: expect.any(Object),
      });
    });
  });

  describe('getHostnameWithRecords', () => {
    it('should return undefined if no custom domain details are found', async () => {
      const customDomain = 'example.com';
      const cloudflareMock = {
        customHostnames: {
          list: jest.fn().mockResolvedValueOnce({ result: [] }),
        },
      };

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');
      (dnsManagerService as any).cloudflareClient = cloudflareMock;

      const result = await dnsManagerService.getHostnameWithRecords(
        customDomain,
        { isPublicDomain: false },
      );

      expect(result).toBeUndefined();
      expect(cloudflareMock.customHostnames.list).toHaveBeenCalledWith({
        zone_id: 'test-zone-id',
        hostname: customDomain,
      });
    });
    it('should return even if no record found', async () => {
      const customDomain = 'example.com';
      const mockResult = {
        id: 'custom-id',
        hostname: customDomain,
        ownership_verification: undefined,
        verification_errors: [],
        ssl: {
          dcv_delegation_records: [],
        },
      };
      const cloudflareMock = {
        customHostnames: {
          list: jest.fn().mockResolvedValueOnce({ result: [mockResult] }),
        },
      };

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');

      jest
        .spyOn(domainServerConfigService, 'getBaseUrl')
        .mockReturnValue(new URL('https://front.domain'));
      (dnsManagerService as any).cloudflareClient = cloudflareMock;

      const result = await dnsManagerService.getHostnameWithRecords(
        customDomain,
        { isPublicDomain: false },
      );

      expect(result).toEqual({
        id: 'custom-id',
        domain: customDomain,
        records: expect.any(Array),
      });
    });

    it('should return domain details if a single result is found', async () => {
      const customDomain = 'example.com';
      const mockResult = {
        id: 'custom-id',
        hostname: customDomain,
        ownership_verification: {
          type: 'txt',
          name: 'ownership',
          value: 'value',
        },
        ssl: {
          validation_records: [{ txt_name: 'ssl', txt_value: 'validation' }],
        },
        verification_errors: [],
      };
      const cloudflareMock = {
        customHostnames: {
          list: jest.fn().mockResolvedValueOnce({ result: [mockResult] }),
        },
      };

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');
      jest
        .spyOn(domainServerConfigService, 'getBaseUrl')
        .mockReturnValue(new URL('https://front.domain'));
      (dnsManagerService as any).cloudflareClient = cloudflareMock;

      const result = await dnsManagerService.getHostnameWithRecords(
        customDomain,
        { isPublicDomain: false },
      );

      expect(result).toEqual({
        id: 'custom-id',
        domain: customDomain,
        records: expect.any(Array),
      });

      expect(result?.records[0].value === 'https://front.domain');
    });

    it('should return public domain details', async () => {
      const customDomain = 'example.com';
      const mockResult = {
        id: 'custom-id',
        hostname: customDomain,
        ownership_verification: {
          type: 'txt',
          name: 'ownership',
          value: 'value',
        },
        ssl: {
          validation_records: [{ txt_name: 'ssl', txt_value: 'validation' }],
        },
        verification_errors: [],
      };
      const cloudflareMock = {
        customHostnames: {
          list: jest.fn().mockResolvedValueOnce({ result: [mockResult] }),
        },
      };

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');
      jest
        .spyOn(domainServerConfigService, 'getBaseUrl')
        .mockReturnValue(new URL('https://front.domain'));

      jest
        .spyOn(domainServerConfigService, 'getPublicDomainUrl')
        .mockReturnValue(new URL('https://front.public-domain'));

      (dnsManagerService as any).cloudflareClient = cloudflareMock;

      const result = await dnsManagerService.getHostnameWithRecords(
        customDomain,
        { isPublicDomain: true },
      );

      expect(result).toEqual({
        id: 'custom-id',
        domain: customDomain,
        records: expect.any(Array),
      });

      expect(result?.records[0].value === 'https://front.public-domain');
    });

    it('should throw an error if multiple results are found', async () => {
      const customDomain = 'example.com';
      const cloudflareMock = {
        customHostnames: {
          list: jest.fn().mockResolvedValueOnce({ result: [{}, {}] }),
        },
      };

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');
      (dnsManagerService as any).cloudflareClient = cloudflareMock;

      await expect(
        dnsManagerService.getHostnameWithRecords(customDomain, {
          isPublicDomain: false,
        }),
      ).rejects.toThrow(Error);
    });
  });

  describe('updateHostname', () => {
    it('should update a custom domain and register a new one', async () => {
      const fromHostname = 'old.com';
      const toHostname = 'new.com';

      jest
        .spyOn(dnsManagerService, 'getHostnameId')
        .mockResolvedValueOnce('old-id');
      jest
        .spyOn(dnsManagerService, 'deleteHostname')
        .mockResolvedValueOnce(undefined);

      const registerSpy = jest
        .spyOn(dnsManagerService, 'registerHostname')
        .mockResolvedValueOnce({} as unknown as CustomHostnameCreateResponse);

      await dnsManagerService.updateHostname(fromHostname, toHostname);

      expect(dnsManagerService.getHostnameId).toHaveBeenCalledWith(
        fromHostname,
        undefined,
      );
      expect(dnsManagerService.deleteHostname).toHaveBeenCalledWith(
        'old-id',
        undefined,
      );
      expect(registerSpy).toHaveBeenCalledWith(toHostname, undefined);
    });
  });

  describe('deleteHostnameSilently', () => {
    it('should delete the custom hostname silently', async () => {
      const customDomain = 'example.com';

      jest
        .spyOn(dnsManagerService, 'getHostnameId')
        .mockResolvedValueOnce('custom-id');
      const deleteMock = jest.fn();
      const cloudflareMock = {
        customHostnames: {
          delete: deleteMock,
        },
      };

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');
      (dnsManagerService as any).cloudflareClient = cloudflareMock;

      await expect(
        dnsManagerService.deleteHostnameSilently(customDomain),
      ).resolves.toBeUndefined();

      expect(deleteMock).toHaveBeenCalledWith('custom-id', {
        zone_id: 'test-zone-id',
      });
    });

    it('should silently handle errors', async () => {
      const customDomain = 'example.com';

      jest
        .spyOn(dnsManagerService, 'getHostnameId')
        .mockRejectedValueOnce(new Error('Failure'));

      await expect(
        dnsManagerService.deleteHostnameSilently(customDomain),
      ).resolves.toBeUndefined();
    });
  });
});
