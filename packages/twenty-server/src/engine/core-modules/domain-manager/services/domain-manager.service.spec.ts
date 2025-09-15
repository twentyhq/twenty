import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';

import { DomainManagerService } from './domain-manager.service';

describe('DomainManagerService', () => {
  describe('getWorkspaceUrls', () => {
    it('should return a URL containing the correct customDomain if customDomain is provided', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      const result = domainManagerService.getWorkspaceUrls({
        subdomain: 'subdomain',
        customDomain: 'custom-host.com',
        isCustomDomainEnabled: true,
      });

      expect(result).toEqual({
        customUrl: 'https://custom-host.com/',
        subdomainUrl: 'https://example.com/',
      });
    });

    it('should return a URL containing the correct subdomain if customDomain is not provided but subdomain is', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
            IS_MULTIWORKSPACE_ENABLED: true,
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      const result = domainManagerService.getWorkspaceUrls({
        subdomain: 'subdomain',
        customDomain: null,
        isCustomDomainEnabled: false,
      });

      expect(result).toEqual({
        customUrl: undefined,
        subdomainUrl: 'https://subdomain.example.com/',
      });
    });
  });
  let domainManagerService: DomainManagerService;
  let twentyConfigService: TwentyConfigService;
  let workspaceRepository: Repository<Workspace>;
  let publicDomainRepository: Repository<PublicDomain>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainManagerService,
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

    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace),
    );
    publicDomainRepository = module.get<Repository<PublicDomain>>(
      getRepositoryToken(PublicDomain),
    );
    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);
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

      const result = domainManagerService.getBaseUrl();

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

      const result = domainManagerService.getBaseUrl();

      expect(result.toString()).toBe('https://test.example.com/');
    });
  });

  describe('buildWorkspaceURL', () => {
    it('should build workspace URL with given subdomain', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
            IS_MULTIWORKSPACE_ENABLED: true,
            DEFAULT_SUBDOMAIN: 'default',
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      const result = domainManagerService.buildWorkspaceURL({
        workspace: {
          subdomain: 'test',
          customDomain: null,
          isCustomDomainEnabled: false,
        },
      });

      expect(result.toString()).toBe('https://test.example.com/');
    });

    it('should set the pathname if provided', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      const result = domainManagerService.buildWorkspaceURL({
        workspace: {
          subdomain: 'test',
          customDomain: null,
          isCustomDomainEnabled: false,
        },
        pathname: '/path/to/resource',
      });

      expect(result.pathname).toBe('/path/to/resource');
    });

    it('should set the search parameters if provided', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      const result = domainManagerService.buildWorkspaceURL({
        workspace: {
          subdomain: 'test',
          customDomain: null,
          isCustomDomainEnabled: false,
        },
        searchParams: {
          foo: 'bar',
          baz: 123,
        },
      });

      expect(result.searchParams.get('foo')).toBe('bar');
      expect(result.searchParams.get('baz')).toBe('123');
    });
  });

  describe('getWorkspaceByOriginOrDefaultWorkspace', () => {
    it('should return default workspace if IS_MULTIWORKSPACE_ENABLED=false', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
            IS_MULTIWORKSPACE_ENABLED: false,
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      jest.spyOn(workspaceRepository, 'find').mockResolvedValueOnce([
        {
          id: 'workspace-id',
        },
      ] as unknown as Workspace[]);

      const result =
        await domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
          'https://example.com',
        );

      expect(result?.id).toEqual('workspace-id');
    });

    it('should return 1st workspace if multiple workspaces when IS_MULTIWORKSPACE_ENABLED=false', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
            IS_MULTIWORKSPACE_ENABLED: false,
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      jest.spyOn(workspaceRepository, 'find').mockResolvedValueOnce([
        {
          id: 'workspace-id1',
        },
        {
          id: 'workspace-id2',
        },
      ] as unknown as Workspace[]);

      const result =
        await domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
          'https://example.com',
        );

      expect(result?.id).toEqual('workspace-id1');
    });

    it('should return workspace by subdomain', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
            IS_MULTIWORKSPACE_ENABLED: true,
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValueOnce({
        id: 'workspace-id1',
        subdomain: '123',
      } as unknown as Promise<Workspace>);

      const result =
        await domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
          'https://123.example.com',
        );

      expect(result?.id).toEqual('workspace-id1');
    });

    it('should return workspace by customDomain', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
            IS_MULTIWORKSPACE_ENABLED: true,
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValueOnce({
        id: 'workspace-id1',
        customDomain: '123.custom.com',
      } as unknown as Promise<Workspace>);

      const result =
        await domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
          'https://123.custom.com',
        );

      expect(result?.id).toEqual('workspace-id1');
    });

    it('should return workspace by publicDomain', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
            IS_MULTIWORKSPACE_ENABLED: true,
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValueOnce({
        id: 'workspace-id1',
      } as unknown as Promise<Workspace>);

      jest.spyOn(publicDomainRepository, 'findOne').mockResolvedValueOnce({
        domain: '123.custom.com',
        workspaceId: 'workspace-id1',
      } as unknown as Promise<PublicDomain>);

      const result =
        await domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
          'https://123.custom.com',
        );

      expect(result?.id).toEqual('workspace-id1');
    });

    it('should return undefined if nothing found', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
            IS_MULTIWORKSPACE_ENABLED: true,
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValueOnce(null);

      jest.spyOn(publicDomainRepository, 'findOne').mockResolvedValueOnce(null);

      const result =
        await domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
          'https://123.custom.com',
        );

      expect(result).toEqual(undefined);
    });
  });
});
