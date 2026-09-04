import { type ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Test, type TestingModule } from '@nestjs/testing';

import { type Issuer } from 'openid-client';

import { OidcAuthGuard } from 'src/engine/core-modules/auth/guards/oidc-auth.guard';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SsoService } from 'src/engine/core-modules/sso/services/sso.service';
import { type SsoConfiguration } from 'src/engine/core-modules/sso/types/sso-configurations.type';
import { type WorkspaceSsoIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

const createMockExecutionContext = (mockedRequest: any): ExecutionContext => {
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockedRequest),
    }),
  } as unknown as ExecutionContext;
};

const createMockedRequest = (params = {}, query = {}) => ({
  params,
  query,
});

jest
  .spyOn(AuthGuard('openidconnect').prototype, 'canActivate')
  .mockResolvedValue(true);

jest.mock('openid-client', () => ({
  Strategy: jest.fn(),
  Issuer: {
    discover: jest.fn().mockResolvedValue({} as Issuer),
  },
}));

describe('OIDCAuthGuard', () => {
  let guard: OidcAuthGuard;
  let ssoService: SsoService;
  let guardRedirectService: GuardRedirectService;
  let mockExecutionContext: ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcAuthGuard,
        {
          provide: SsoService,
          useValue: {
            findSsoIdentityProviderById: jest.fn(),
            getOidcClient: jest.fn(),
          },
        },
        {
          provide: GuardRedirectService,
          useValue: {
            dispatchErrorFromGuard: jest.fn(),
            getSubdomainAndCustomDomainFromWorkspace: jest.fn(),
          },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain:
              jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<OidcAuthGuard>(OidcAuthGuard);
    ssoService = module.get<SsoService>(SsoService);
    guardRedirectService =
      module.get<GuardRedirectService>(GuardRedirectService);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  });

  it('should activate when identity provider exists and is valid', async () => {
    const mockedRequest = createMockedRequest({
      identityProviderId: 'test-id',
    });

    mockExecutionContext = createMockExecutionContext(mockedRequest);

    jest.spyOn(ssoService, 'findSsoIdentityProviderById').mockResolvedValue({
      id: 'test-id',
      issuer: 'https://issuer.example.com',
      workspace: {},
    } as SsoConfiguration & WorkspaceSsoIdentityProviderEntity);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(guardRedirectService.dispatchErrorFromGuard).not.toHaveBeenCalled();
    expect(ssoService.findSsoIdentityProviderById).toHaveBeenCalledWith(
      'test-id',
    );
  });

  it('should throw error when identity provider is not found', async () => {
    const mockedRequest = createMockedRequest({
      identityProviderId: 'non-existent-id',
    });

    mockExecutionContext = createMockExecutionContext(mockedRequest);

    jest
      .spyOn(ssoService, 'findSsoIdentityProviderById')
      .mockResolvedValue(null);

    await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(false);
    expect(ssoService.findSsoIdentityProviderById).toHaveBeenCalledWith(
      'non-existent-id',
    );
    expect(guardRedirectService.dispatchErrorFromGuard).toHaveBeenCalled();
  });

  it('should handle invalid OIDC identity provider params in request', async () => {
    const mockedRequest = createMockedRequest({
      identityProviderId: undefined,
    });

    mockExecutionContext = createMockExecutionContext(mockedRequest);

    jest
      .spyOn(ssoService, 'findSsoIdentityProviderById')
      .mockResolvedValue(null);

    await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(false);
    expect(guardRedirectService.dispatchErrorFromGuard).toHaveBeenCalled();
  });
});
