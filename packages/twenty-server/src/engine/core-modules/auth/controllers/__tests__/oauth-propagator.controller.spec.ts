import { ForbiddenException } from '@nestjs/common';

import { OAuthPropagatorController } from 'src/engine/core-modules/auth/controllers/oauth-propagator.controller';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

describe('OAuthPropagatorController', () => {
  const createController = ({
    isMultiWorkspaceEnabled = false,
    nodeEnv = NodeEnvironment.PRODUCTION,
    frontHostname = 'app.example.com',
    findByCustomDomainResult = null as { id: string } | null,
    publicDomainResult = null as { domain: string } | null,
    workspaceByOriginResult = null as { id: string } | null,
  } = {}) => {
    const domainServerConfigService = {
      getFrontUrl: jest.fn(() => new URL(`https://${frontHostname}`)),
    };
    const twentyConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') {
          return nodeEnv;
        }
        if (key === 'IS_MULTIWORKSPACE_ENABLED') {
          return isMultiWorkspaceEnabled;
        }

        return undefined;
      }),
    };
    const workspaceDomainsService = {
      findByCustomDomain: jest.fn(async () => findByCustomDomainResult),
      resolveWorkspaceAndPublicDomain: jest.fn(async () => ({
        workspace: undefined,
        publicDomain: publicDomainResult,
        isIsolatedOrigin: publicDomainResult !== null,
      })),
      getWorkspaceByOriginOrDefaultWorkspace: jest.fn(
        async () => workspaceByOriginResult,
      ),
    };

    const controller = new OAuthPropagatorController(
      domainServerConfigService as never,
      twentyConfigService as never,
      workspaceDomainsService as never,
    );

    return { controller, workspaceDomainsService };
  };

  const callPropagate = async (
    controller: OAuthPropagatorController,
    state: string,
  ) => {
    const res = {
      redirect: jest.fn(),
    };

    await controller.propagateOAuthCallback(state, 'oauth-code', res as never);

    return res;
  };

  it('should reject attacker hostnames in single-workspace production mode', async () => {
    const { controller } = createController();

    await expect(
      callPropagate(
        controller,
        encodeURIComponent('https://attacker.example.com/phish'),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should allow the configured front hostname', async () => {
    const { controller } = createController();

    const res = await callPropagate(
      controller,
      encodeURIComponent('https://app.example.com/auth/callback'),
    );

    expect(res.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining('https://app.example.com/auth/callback'),
    );
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining('code=oauth-code'),
    );
  });

  it('should allow a registered custom domain', async () => {
    const { controller } = createController({
      findByCustomDomainResult: { id: 'workspace-1' },
    });

    const res = await callPropagate(
      controller,
      encodeURIComponent('https://crm.customer.com/auth/callback'),
    );

    expect(res.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining('https://crm.customer.com/auth/callback'),
    );
  });

  it('should allow a registered public domain', async () => {
    const { controller } = createController({
      publicDomainResult: { domain: 'public.customer.com' },
    });

    const res = await callPropagate(
      controller,
      encodeURIComponent('https://public.customer.com/auth/callback'),
    );

    expect(res.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining('https://public.customer.com/auth/callback'),
    );
  });

  it('should allow multi-workspace subdomains only when a workspace resolves', async () => {
    const { controller, workspaceDomainsService } = createController({
      isMultiWorkspaceEnabled: true,
      workspaceByOriginResult: { id: 'workspace-2' },
    });

    const res = await callPropagate(
      controller,
      encodeURIComponent('https://acme.app.example.com/auth/callback'),
    );

    expect(
      workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace,
    ).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining('https://acme.app.example.com/auth/callback'),
    );
  });

  it('should reject multi-workspace subdomains when no workspace resolves', async () => {
    const { controller } = createController({
      isMultiWorkspaceEnabled: true,
      workspaceByOriginResult: null,
    });

    await expect(
      callPropagate(
        controller,
        encodeURIComponent('https://unknown.app.example.com/auth/callback'),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
