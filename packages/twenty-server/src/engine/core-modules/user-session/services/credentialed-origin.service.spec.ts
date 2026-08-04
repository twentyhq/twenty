import { Test, type TestingModule } from '@nestjs/testing';

import { type Request } from 'express';

import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CredentialedOriginService } from 'src/engine/core-modules/user-session/services/credentialed-origin.service';

describe('CredentialedOriginService', () => {
  let service: CredentialedOriginService;

  const defaultConfig: Record<string, unknown> = {
    SERVER_URL: 'https://api.example.com',
    FRONTEND_URL: 'https://front.example.com',
    AUTH_COOKIE_ALLOWED_ORIGINS: '',
    IS_MULTIWORKSPACE_ENABLED: false,
  };

  let mockConfig: Record<string, unknown> = { ...defaultConfig };

  const mockWorkspaceDomainsService = {
    resolveWorkspaceAndPublicDomain: jest.fn(),
    getWorkspaceUrls: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfig = { ...defaultConfig };
    mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      { workspace: undefined, publicDomain: null, isIsolatedOrigin: false },
    );
    mockWorkspaceDomainsService.getWorkspaceUrls.mockReturnValue({
      customUrl: undefined,
      subdomainUrl: 'https://front.example.com',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialedOriginService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: mockWorkspaceDomainsService,
        },
      ],
    }).compile();

    service = module.get<CredentialedOriginService>(CredentialedOriginService);
  });

  describe('isOriginAllowed', () => {
    it('should allow the statically allowlisted origins without a workspace lookup', async () => {
      await expect(
        service.isOriginAllowed('https://front.example.com'),
      ).resolves.toBe(true);
      await expect(
        service.isOriginAllowed('https://api.example.com'),
      ).resolves.toBe(true);

      expect(
        mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain,
      ).not.toHaveBeenCalled();
    });

    it('should deny unknown origins without a workspace lookup when multiworkspace is disabled', async () => {
      await expect(
        service.isOriginAllowed('https://myworkspace.front.example.com'),
      ).resolves.toBe(false);

      expect(
        mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain,
      ).not.toHaveBeenCalled();
    });

    it('should deny non-http origins', async () => {
      await expect(service.isOriginAllowed('null')).resolves.toBe(false);
      await expect(service.isOriginAllowed('file:///etc/passwd')).resolves.toBe(
        false,
      );
    });

    describe('with multiworkspace enabled', () => {
      beforeEach(() => {
        mockConfig.IS_MULTIWORKSPACE_ENABLED = true;
      });

      it('should allow the exact front origin of an existing workspace subdomain', async () => {
        mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
          {
            workspace: { subdomain: 'myworkspace' },
            publicDomain: null,
            isIsolatedOrigin: false,
          },
        );
        mockWorkspaceDomainsService.getWorkspaceUrls.mockReturnValue({
          customUrl: undefined,
          subdomainUrl: 'https://myworkspace.front.example.com',
        });

        await expect(
          service.isOriginAllowed('https://myworkspace.front.example.com'),
        ).resolves.toBe(true);
      });

      it('should allow the active custom domain of an existing workspace', async () => {
        mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
          {
            workspace: { customDomain: 'crm.customer.com' },
            publicDomain: null,
            isIsolatedOrigin: false,
          },
        );
        mockWorkspaceDomainsService.getWorkspaceUrls.mockReturnValue({
          customUrl: 'https://crm.customer.com',
          subdomainUrl: 'https://myworkspace.front.example.com',
        });

        await expect(
          service.isOriginAllowed('https://crm.customer.com'),
        ).resolves.toBe(true);
      });

      it('should deny a front-domain sibling that resolves no workspace', async () => {
        await expect(
          service.isOriginAllowed('https://not-a-workspace.front.example.com'),
        ).resolves.toBe(false);
      });

      it('should deny an origin whose protocol or port differs from the workspace front url', async () => {
        mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
          {
            workspace: { subdomain: 'myworkspace' },
            publicDomain: null,
            isIsolatedOrigin: false,
          },
        );
        mockWorkspaceDomainsService.getWorkspaceUrls.mockReturnValue({
          customUrl: undefined,
          subdomainUrl: 'https://myworkspace.front.example.com',
        });

        await expect(
          service.isOriginAllowed('http://myworkspace.front.example.com'),
        ).resolves.toBe(false);
        await expect(
          service.isOriginAllowed('https://myworkspace.front.example.com:8443'),
        ).resolves.toBe(false);
      });

      it('should deny an origin that resolves a workspace through a public domain rather than its front url', async () => {
        mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
          {
            workspace: { subdomain: 'myworkspace' },
            publicDomain: { domain: 'myworkspace.public.example.com' },
            isIsolatedOrigin: true,
          },
        );
        mockWorkspaceDomainsService.getWorkspaceUrls.mockReturnValue({
          customUrl: undefined,
          subdomainUrl: 'https://myworkspace.front.example.com',
        });

        await expect(
          service.isOriginAllowed('https://myworkspace.public.example.com'),
        ).resolves.toBe(false);
      });

      it('should memoize the workspace verdict for repeated checks of the same origin', async () => {
        mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
          {
            workspace: { subdomain: 'myworkspace' },
            publicDomain: null,
            isIsolatedOrigin: false,
          },
        );
        mockWorkspaceDomainsService.getWorkspaceUrls.mockReturnValue({
          customUrl: undefined,
          subdomainUrl: 'https://myworkspace.front.example.com',
        });

        await service.isOriginAllowed('https://myworkspace.front.example.com');
        await service.isOriginAllowed('https://myworkspace.front.example.com');

        expect(
          mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain,
        ).toHaveBeenCalledTimes(1);
      });

      it('should fail closed when the workspace lookup throws', async () => {
        mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain.mockRejectedValue(
          new Error('database unavailable'),
        );

        await expect(
          service.isOriginAllowed('https://myworkspace.front.example.com'),
        ).resolves.toBe(false);
      });
    });
  });

  describe('isRequestOriginAllowed', () => {
    const buildRequest = (host: string, protocol = 'https'): Request =>
      ({
        protocol,
        get: jest.fn().mockReturnValue(host),
        headers: {},
      }) as unknown as Request;

    it('should allow a same-origin request even when the origin is not allowlisted', async () => {
      await expect(
        service.isRequestOriginAllowed({
          origin: 'https://api.example.com',
          request: buildRequest('api.example.com'),
        }),
      ).resolves.toBe(true);
    });

    it('should fall back to the credentialed origin check for cross-origin requests', async () => {
      await expect(
        service.isRequestOriginAllowed({
          origin: 'https://front.example.com',
          request: buildRequest('api.example.com'),
        }),
      ).resolves.toBe(true);
      await expect(
        service.isRequestOriginAllowed({
          origin: 'https://evil.example.org',
          request: buildRequest('api.example.com'),
        }),
      ).resolves.toBe(false);
    });
  });
});
