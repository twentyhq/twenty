import { ForbiddenException } from '@nestjs/common';

import { Response } from 'express';

import { OAuthPropagatorController } from 'src/engine/core-modules/auth/controllers/oauth-propagator.controller';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';

describe('OAuthPropagatorController', () => {
  it('should redirect when state points to the configured frontend hostname', async () => {
    const domainServerConfigService = {
      getFrontUrl: jest.fn().mockReturnValue(new URL('https://app.twenty.com')),
    };
    const workspaceDomainsService = {
      resolveWorkspaceAndPublicDomain: jest.fn().mockResolvedValue({
        workspace: undefined,
        publicDomain: null,
      }),
    };

    const controller = new OAuthPropagatorController(
      domainServerConfigService as unknown as DomainServerConfigService,
      workspaceDomainsService as unknown as WorkspaceDomainsService,
    );
    const response = {
      redirect: jest.fn(),
    };

    await controller.propagateOAuthCallback(
      encodeURIComponent('https://app.twenty.com/auth/callback?foo=bar'),
      'oauth-code-123',
      response as unknown as Response,
    );

    expect(response.redirect).toHaveBeenCalledWith(
      302,
      'https://app.twenty.com/auth/callback?foo=bar&code=oauth-code-123&state=https%253A%252F%252Fapp.twenty.com%252Fauth%252Fcallback%253Ffoo%253Dbar',
    );
  });

  it('should reject attacker-host redirects even when single-workspace fallback resolves a workspace', async () => {
    const domainServerConfigService = {
      getFrontUrl: jest.fn().mockReturnValue(new URL('https://app.twenty.com')),
    };
    const workspaceDomainsService = {
      resolveWorkspaceAndPublicDomain: jest.fn().mockResolvedValue({
        workspace: {
          subdomain: 'acme',
          customDomain: null,
          isCustomDomainEnabled: false,
        },
        publicDomain: null,
      }),
    };

    const controller = new OAuthPropagatorController(
      domainServerConfigService as unknown as DomainServerConfigService,
      workspaceDomainsService as unknown as WorkspaceDomainsService,
    );

    await expect(
      controller.propagateOAuthCallback(
        encodeURIComponent('https://attacker.example/phish'),
        'oauth-code-123',
        { redirect: jest.fn() } as unknown as Response,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should reject non-http redirect protocols', async () => {
    const domainServerConfigService = {
      getFrontUrl: jest.fn().mockReturnValue(new URL('https://app.twenty.com')),
    };
    const workspaceDomainsService = {
      resolveWorkspaceAndPublicDomain: jest.fn(),
    };

    const controller = new OAuthPropagatorController(
      domainServerConfigService as unknown as DomainServerConfigService,
      workspaceDomainsService as unknown as WorkspaceDomainsService,
    );

    await expect(
      controller.propagateOAuthCallback(
        encodeURIComponent('javascript:alert(1)'),
        'oauth-code-123',
        { redirect: jest.fn() } as unknown as Response,
      ),
    ).rejects.toThrow('Invalid redirect URI in state');

    expect(
      workspaceDomainsService.resolveWorkspaceAndPublicDomain,
    ).not.toHaveBeenCalled();
  });
});
