import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import Cloudflare from 'cloudflare';
import { type CustomHostnameCreateResponse } from 'cloudflare/resources/custom-hostnames/custom-hostnames';
import { AuditContextMock } from 'test/utils/audit-context.mock';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { DnsManagerException } from 'src/engine/core-modules/dns-manager/exceptions/dns-manager.exception';

jest.mock('cloudflare');

describe('DnsManagerService', () => {
  let dnsManagerService: DnsManagerService;
  let twentyConfigService: TwentyConfigService;
  let domainManagerService: DomainManagerService;

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
          provide: DomainManagerService,
          useValue: {
            getBaseUrl: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Workspace),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    dnsManagerService = module.get<DnsManagerService>(DnsManagerService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);

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
        .spyOn(dnsManagerService, 'getHostnameDetails')
        .mockResolvedValueOnce({} as any);

      await expect(
        dnsManagerService.registerHostname(customDomain),
      ).rejects.toThrow(DnsManagerException);
      expect(dnsManagerService.getHostnameDetails).toHaveBeenCalledWith(
        customDomain,
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
        .spyOn(dnsManagerService, 'getHostnameDetails')
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

  describe('getHostnameDetails', () => {
    it('should return undefined if no custom domain details are found', async () => {
      const customDomain = 'example.com';
      const cloudflareMock = {
        customHostnames: {
          list: jest.fn().mockResolvedValueOnce({ result: [] }),
        },
      };

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');
      (dnsManagerService as any).cloudflareClient = cloudflareMock;

      const result = await dnsManagerService.getHostnameDetails(customDomain);

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
        .spyOn(domainManagerService, 'getBaseUrl')
        .mockReturnValue(new URL('https://front.domain'));
      (dnsManagerService as any).cloudflareClient = cloudflareMock;

      const result = await dnsManagerService.getHostnameDetails(customDomain);

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
        .spyOn(domainManagerService, 'getBaseUrl')
        .mockReturnValue(new URL('https://front.domain'));
      (dnsManagerService as any).cloudflareClient = cloudflareMock;

      const result = await dnsManagerService.getHostnameDetails(customDomain);

      expect(result).toEqual({
        id: 'custom-id',
        domain: customDomain,
        records: expect.any(Array),
      });
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
        dnsManagerService.getHostnameDetails(customDomain),
      ).rejects.toThrow(Error);
    });
  });

  describe('updateHostname', () => {
    it('should update a custom domain and register a new one', async () => {
      const fromHostname = 'old.com';
      const toHostname = 'new.com';

      jest
        .spyOn(dnsManagerService, 'getHostnameDetails')
        .mockResolvedValueOnce({ id: 'old-id' } as any);
      jest
        .spyOn(dnsManagerService, 'deleteHostname')
        .mockResolvedValueOnce(undefined);
      const registerSpy = jest
        .spyOn(dnsManagerService, 'registerHostname')
        .mockResolvedValueOnce({} as unknown as CustomHostnameCreateResponse);

      await dnsManagerService.updateHostname(fromHostname, toHostname);

      expect(dnsManagerService.getHostnameDetails).toHaveBeenCalledWith(
        fromHostname,
      );
      expect(dnsManagerService.deleteHostname).toHaveBeenCalledWith('old-id');
      expect(registerSpy).toHaveBeenCalledWith(toHostname);
    });
  });

  describe('deleteHostnameSilently', () => {
    it('should delete the custom hostname silently', async () => {
      const customDomain = 'example.com';

      jest
        .spyOn(dnsManagerService, 'getHostnameDetails')
        .mockResolvedValueOnce({ id: 'custom-id' } as any);
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
        .spyOn(dnsManagerService, 'getHostnameDetails')
        .mockRejectedValueOnce(new Error('Failure'));

      await expect(
        dnsManagerService.deleteHostnameSilently(customDomain),
      ).resolves.toBeUndefined();
    });
  });
});
