import { Test, TestingModule } from '@nestjs/testing';

import Cloudflare from 'cloudflare';
import { CustomHostnameCreateResponse } from 'cloudflare/resources/custom-hostnames/custom-hostnames';
import { AnalyticsContextMock } from 'test/utils/analytics-context.mock';

import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { DomainManagerException } from 'src/engine/core-modules/domain-manager/domain-manager.exception';
import { AnalyticsService } from 'src/engine/core-modules/analytics/services/analytics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

jest.mock('cloudflare');

describe('CustomDomainService', () => {
  let customDomainService: CustomDomainService;
  let twentyConfigService: TwentyConfigService;
  let domainManagerService: DomainManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomDomainService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AnalyticsService,
          useValue: {
            createAnalyticsContext: AnalyticsContextMock,
          },
        },
        {
          provide: DomainManagerService,
          useValue: {
            getFrontUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    customDomainService = module.get<CustomDomainService>(CustomDomainService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);

    (customDomainService as any).cloudflareClient = {
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

    const instance = new CustomDomainService(twentyConfigService, {} as any);

    expect(twentyConfigService.get).toHaveBeenCalledWith('CLOUDFLARE_API_KEY');
    expect(Cloudflare).toHaveBeenCalledWith({ apiToken: mockApiKey });
    expect(instance.cloudflareClient).toBeDefined();
  });

  describe('registerCustomDomain', () => {
    it('should throw an error when the hostname is already registered', async () => {
      const customDomain = 'example.com';

      jest
        .spyOn(customDomainService, 'getCustomDomainDetails')
        .mockResolvedValueOnce({} as any);

      await expect(
        customDomainService.registerCustomDomain(customDomain),
      ).rejects.toThrow(DomainManagerException);
      expect(customDomainService.getCustomDomainDetails).toHaveBeenCalledWith(
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
        .spyOn(customDomainService, 'getCustomDomainDetails')
        .mockResolvedValueOnce(undefined);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');
      (customDomainService as any).cloudflareClient = cloudflareMock;

      await customDomainService.registerCustomDomain(customDomain);

      expect(createMock).toHaveBeenCalledWith({
        zone_id: 'test-zone-id',
        hostname: customDomain,
        ssl: expect.any(Object),
      });
    });
  });

  describe('getCustomDomainDetails', () => {
    it('should return undefined if no custom domain details are found', async () => {
      const customDomain = 'example.com';
      const cloudflareMock = {
        customHostnames: {
          list: jest.fn().mockResolvedValueOnce({ result: [] }),
        },
      };

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');
      (customDomainService as any).cloudflareClient = cloudflareMock;

      const result =
        await customDomainService.getCustomDomainDetails(customDomain);

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
      };
      const cloudflareMock = {
        customHostnames: {
          list: jest.fn().mockResolvedValueOnce({ result: [mockResult] }),
        },
      };

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');

      jest
        .spyOn(domainManagerService, 'getFrontUrl')
        .mockReturnValue(new URL('https://front.domain'));
      (customDomainService as any).cloudflareClient = cloudflareMock;

      const result =
        await customDomainService.getCustomDomainDetails(customDomain);

      expect(result).toEqual({
        id: 'custom-id',
        customDomain: customDomain,
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
        .spyOn(domainManagerService, 'getFrontUrl')
        .mockReturnValue(new URL('https://front.domain'));
      (customDomainService as any).cloudflareClient = cloudflareMock;

      const result =
        await customDomainService.getCustomDomainDetails(customDomain);

      expect(result).toEqual({
        id: 'custom-id',
        customDomain: customDomain,
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
      (customDomainService as any).cloudflareClient = cloudflareMock;

      await expect(
        customDomainService.getCustomDomainDetails(customDomain),
      ).rejects.toThrow(Error);
    });
  });

  describe('updateCustomDomain', () => {
    it('should update a custom domain and register a new one', async () => {
      const fromHostname = 'old.com';
      const toHostname = 'new.com';

      jest
        .spyOn(customDomainService, 'getCustomDomainDetails')
        .mockResolvedValueOnce({ id: 'old-id' } as any);
      jest
        .spyOn(customDomainService, 'deleteCustomHostname')
        .mockResolvedValueOnce(undefined);
      const registerSpy = jest
        .spyOn(customDomainService, 'registerCustomDomain')
        .mockResolvedValueOnce({} as unknown as CustomHostnameCreateResponse);

      await customDomainService.updateCustomDomain(fromHostname, toHostname);

      expect(customDomainService.getCustomDomainDetails).toHaveBeenCalledWith(
        fromHostname,
      );
      expect(customDomainService.deleteCustomHostname).toHaveBeenCalledWith(
        'old-id',
      );
      expect(registerSpy).toHaveBeenCalledWith(toHostname);
    });
  });

  describe('deleteCustomHostnameByHostnameSilently', () => {
    it('should delete the custom hostname silently', async () => {
      const customDomain = 'example.com';

      jest
        .spyOn(customDomainService, 'getCustomDomainDetails')
        .mockResolvedValueOnce({ id: 'custom-id' } as any);
      const deleteMock = jest.fn();
      const cloudflareMock = {
        customHostnames: {
          delete: deleteMock,
        },
      };

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('test-zone-id');
      (customDomainService as any).cloudflareClient = cloudflareMock;

      await expect(
        customDomainService.deleteCustomHostnameByHostnameSilently(
          customDomain,
        ),
      ).resolves.toBeUndefined();
      expect(deleteMock).toHaveBeenCalledWith('custom-id', {
        zone_id: 'test-zone-id',
      });
    });

    it('should silently handle errors', async () => {
      const customDomain = 'example.com';

      jest
        .spyOn(customDomainService, 'getCustomDomainDetails')
        .mockRejectedValueOnce(new Error('Failure'));

      await expect(
        customDomainService.deleteCustomHostnameByHostnameSilently(
          customDomain,
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('isCustomDomainWorking', () => {
    it('should return true if all records have success status', () => {
      const customDomainDetails = {
        records: [{ status: 'success' }, { status: 'success' }],
      } as any;

      expect(
        customDomainService.isCustomDomainWorking(customDomainDetails),
      ).toBe(true);
    });

    it('should return false if any record does not have success status', () => {
      const customDomainDetails = {
        records: [{ status: 'success' }, { status: 'pending' }],
      } as any;

      expect(
        customDomainService.isCustomDomainWorking(customDomainDetails),
      ).toBe(false);
    });
  });
});
