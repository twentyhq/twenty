import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

describe('SubdomainManagerService', () => {
  let domainServerConfigService: DomainServerConfigService;
  let twentyConfigService: TwentyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainServerConfigService,
        {
          provide: getRepositoryToken(Workspace),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PublicDomain),
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
});
