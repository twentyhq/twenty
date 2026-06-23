import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('SubdomainManagerService', () => {
  let domainServerConfigService: DomainServerConfigService;
  let twentyConfigService: TwentyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainServerConfigService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApprovedAccessDomainEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    domainServerConfigService = module.get<DomainServerConfigService>(
      DomainServerConfigService,
    );
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  describe('buildBaseUrl', () => {
    it('should build the base URL from environment variables', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      const result = domainServerConfigService.getBaseUrl();

      expect(result.toString()).toBe('https://example.com/');
    });

    it('should append default subdomain if multiworkspace is enabled', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
            IS_MULTIWORKSPACE_ENABLED: true,
            DEFAULT_SUBDOMAIN: 'test',
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      const result = domainServerConfigService.getBaseUrl();

      expect(result.toString()).toBe('https://test.example.com/');
    });
  });

  describe('getSubdomainAndDomainFromUrl', () => {
    const mockConfig = (env: Record<string, unknown>) => {
      jest.spyOn(twentyConfigService, 'get').mockImplementation(
        // @ts-expect-error legacy noImplicitAny
        (key: string) => env[key],
      );
    };

    it('extracts the subdomain of the front domain (not isolated)', () => {
      mockConfig({ FRONTEND_URL: 'https://twenty.com' });

      expect(
        domainServerConfigService.getSubdomainAndDomainFromUrl(
          'https://acme.twenty.com',
        ),
      ).toEqual({
        subdomain: 'acme',
        domain: null,
        isPublicDomainOrigin: false,
      });
    });

    it('flags a subdomain of the public domain base as isolated', () => {
      mockConfig({
        FRONTEND_URL: 'https://twenty.com',
        PUBLIC_DOMAIN_URL: 'https://withtwenty.com',
      });

      expect(
        domainServerConfigService.getSubdomainAndDomainFromUrl(
          'https://acme.withtwenty.com',
        ),
      ).toEqual({
        subdomain: 'acme',
        domain: null,
        isPublicDomainOrigin: true,
      });
    });

    it('treats an unrelated host as a custom domain', () => {
      mockConfig({
        FRONTEND_URL: 'https://twenty.com',
        PUBLIC_DOMAIN_URL: 'https://withtwenty.com',
      });

      expect(
        domainServerConfigService.getSubdomainAndDomainFromUrl(
          'https://crm.acme.com',
        ),
      ).toEqual({
        subdomain: undefined,
        domain: 'crm.acme.com',
        isPublicDomainOrigin: false,
      });
    });

    it('does not treat the default subdomain as a subdomain', () => {
      mockConfig({
        FRONTEND_URL: 'https://twenty.com',
        DEFAULT_SUBDOMAIN: 'app',
      });

      expect(
        domainServerConfigService.getSubdomainAndDomainFromUrl(
          'https://app.twenty.com',
        ),
      ).toEqual({
        subdomain: undefined,
        domain: null,
        isPublicDomainOrigin: false,
      });
    });
  });

  describe('isPublicFunctionDomainHost', () => {
    it('is true for a subdomain of the public base', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) =>
          key === 'PUBLIC_DOMAIN_URL' ? 'https://withtwenty.com' : undefined,
        );

      expect(
        domainServerConfigService.isPublicFunctionDomainHost(
          'acme.withtwenty.com',
        ),
      ).toBe(true);
    });

    it('is false when no public base is configured', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation(() => undefined);

      expect(
        domainServerConfigService.isPublicFunctionDomainHost(
          'acme.withtwenty.com',
        ),
      ).toBe(false);
    });
  });
});
