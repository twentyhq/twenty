import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('WorkspaceDomainsService', () => {
  let workspaceDomainsService: WorkspaceDomainsService;
  let twentyConfigService: TwentyConfigService;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let publicDomainRepository: Repository<PublicDomainEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainServerConfigService,
        WorkspaceDomainsService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PublicDomainEntity),
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

    workspaceRepository = module.get<Repository<WorkspaceEntity>>(
      getRepositoryToken(WorkspaceEntity),
    );
    publicDomainRepository = module.get<Repository<PublicDomainEntity>>(
      getRepositoryToken(PublicDomainEntity),
    );
    workspaceDomainsService = module.get<WorkspaceDomainsService>(
      WorkspaceDomainsService,
    );

    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

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

      const result = workspaceDomainsService.getWorkspaceUrls({
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

      const result = workspaceDomainsService.getWorkspaceUrls({
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

      const result = workspaceDomainsService.buildWorkspaceURL({
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

      const result = workspaceDomainsService.buildWorkspaceURL({
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

      const result = workspaceDomainsService.buildWorkspaceURL({
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

    it('should set the hash if provided', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONTEND_URL: 'https://example.com',
          };

          // @ts-expect-error legacy noImplicitAny
          return env[key];
        });

      const result = workspaceDomainsService.buildWorkspaceURL({
        workspace: {
          subdomain: 'test',
          customDomain: null,
          isCustomDomainEnabled: false,
        },
        pathname: '/settings/members',
        searchParams: {
          wtdId: 'domain-id',
        },
        hash: 'invite',
      });

      expect(result.hash).toBe('#invite');
      expect(result.searchParams.get('wtdId')).toBe('domain-id');
      expect(result.toString()).toBe(
        'https://example.com/settings/members?wtdId=domain-id#invite',
      );
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
      ] as unknown as WorkspaceEntity[]);

      const result =
        await workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
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
      ] as unknown as WorkspaceEntity[]);

      const result =
        await workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
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
      } as unknown as Promise<WorkspaceEntity>);

      const result =
        await workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
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
      } as unknown as Promise<WorkspaceEntity>);

      const result =
        await workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
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
      } as unknown as Promise<WorkspaceEntity>);

      jest.spyOn(publicDomainRepository, 'findOne').mockResolvedValueOnce({
        domain: '123.custom.com',
        workspaceId: 'workspace-id1',
      } as unknown as Promise<PublicDomainEntity>);

      const result =
        await workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
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
        await workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
          'https://123.custom.com',
        );

      expect(result).toEqual(undefined);
    });
  });

  describe('isRedirectUrlWithinResolvedWorkspaceDomains', () => {
    const setupConfig = (config: Record<string, unknown>) => {
      jest
        .spyOn(twentyConfigService, 'get')
        // @ts-expect-error legacy noImplicitAny
        .mockImplementation((key: string) => config[key]);
    };

    const mockResolvedWorkspace = (resolved: {
      workspace?: Partial<WorkspaceEntity>;
      publicDomain?: Partial<PublicDomainEntity> | null;
    }) => {
      jest
        .spyOn(workspaceDomainsService, 'resolveWorkspaceAndPublicDomain')
        .mockResolvedValue({
          workspace: resolved.workspace as WorkspaceEntity | undefined,
          publicDomain: (resolved.publicDomain ??
            null) as PublicDomainEntity | null,
          isIsolatedOrigin: false,
        });
    };

    it('should return false when no workspace is resolved', async () => {
      setupConfig({
        FRONTEND_URL: 'https://app.twenty.com',
        IS_MULTIWORKSPACE_ENABLED: false,
      });
      mockResolvedWorkspace({ workspace: undefined });

      const result =
        await workspaceDomainsService.isRedirectUrlWithinResolvedWorkspaceDomains(
          new URL('https://app.twenty.com/callback'),
        );

      expect(result).toBe(false);
    });

    it('should allow a redirect matching the subdomain origin in single-workspace mode', async () => {
      setupConfig({
        FRONTEND_URL: 'https://app.twenty.com',
        IS_MULTIWORKSPACE_ENABLED: false,
      });
      mockResolvedWorkspace({
        workspace: {
          subdomain: 'acme',
          customDomain: null,
          isCustomDomainEnabled: false,
        },
      });

      const result =
        await workspaceDomainsService.isRedirectUrlWithinResolvedWorkspaceDomains(
          new URL('https://app.twenty.com/callback'),
        );

      expect(result).toBe(true);
    });

    it('should allow a redirect matching the subdomain origin in multi-workspace mode', async () => {
      setupConfig({
        FRONTEND_URL: 'https://app.twenty.com',
        IS_MULTIWORKSPACE_ENABLED: true,
      });
      mockResolvedWorkspace({
        workspace: {
          subdomain: 'acme',
          customDomain: null,
          isCustomDomainEnabled: false,
        },
      });

      const result =
        await workspaceDomainsService.isRedirectUrlWithinResolvedWorkspaceDomains(
          new URL('https://acme.app.twenty.com/callback'),
        );

      expect(result).toBe(true);
    });

    it('should reject an http origin when the allowed origin is https', async () => {
      setupConfig({
        FRONTEND_URL: 'https://app.twenty.com',
        IS_MULTIWORKSPACE_ENABLED: false,
      });
      mockResolvedWorkspace({
        workspace: {
          subdomain: 'acme',
          customDomain: null,
          isCustomDomainEnabled: false,
        },
      });

      const result =
        await workspaceDomainsService.isRedirectUrlWithinResolvedWorkspaceDomains(
          new URL('http://app.twenty.com/callback'),
        );

      expect(result).toBe(false);
    });

    it('should reject an origin with a mismatched port', async () => {
      setupConfig({
        FRONTEND_URL: 'https://app.twenty.com',
        IS_MULTIWORKSPACE_ENABLED: false,
      });
      mockResolvedWorkspace({
        workspace: {
          subdomain: 'acme',
          customDomain: null,
          isCustomDomainEnabled: false,
        },
      });

      const result =
        await workspaceDomainsService.isRedirectUrlWithinResolvedWorkspaceDomains(
          new URL('https://app.twenty.com:8080/callback'),
        );

      expect(result).toBe(false);
    });

    it('should allow the custom domain origin when isCustomDomainEnabled is true', async () => {
      setupConfig({
        FRONTEND_URL: 'https://app.twenty.com',
        IS_MULTIWORKSPACE_ENABLED: false,
      });
      mockResolvedWorkspace({
        workspace: {
          subdomain: 'acme',
          customDomain: 'custom.example.com',
          isCustomDomainEnabled: true,
        },
      });

      const result =
        await workspaceDomainsService.isRedirectUrlWithinResolvedWorkspaceDomains(
          new URL('https://custom.example.com/callback'),
        );

      expect(result).toBe(true);
    });

    it('should reject the custom domain origin when isCustomDomainEnabled is false', async () => {
      setupConfig({
        FRONTEND_URL: 'https://app.twenty.com',
        IS_MULTIWORKSPACE_ENABLED: false,
      });
      mockResolvedWorkspace({
        workspace: {
          subdomain: 'acme',
          customDomain: 'custom.example.com',
          isCustomDomainEnabled: false,
        },
      });

      const result =
        await workspaceDomainsService.isRedirectUrlWithinResolvedWorkspaceDomains(
          new URL('https://custom.example.com/callback'),
        );

      expect(result).toBe(false);
    });

    it('should allow the resolved public domain origin', async () => {
      setupConfig({
        FRONTEND_URL: 'https://app.twenty.com',
        IS_MULTIWORKSPACE_ENABLED: false,
      });
      mockResolvedWorkspace({
        workspace: {
          subdomain: 'acme',
          customDomain: null,
          isCustomDomainEnabled: false,
        },
        publicDomain: { domain: 'public.example.com' },
      });

      const result =
        await workspaceDomainsService.isRedirectUrlWithinResolvedWorkspaceDomains(
          new URL('https://public.example.com/callback'),
        );

      expect(result).toBe(true);
    });
  });
});
