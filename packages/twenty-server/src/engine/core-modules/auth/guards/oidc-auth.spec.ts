import { type ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Test, type TestingModule } from '@nestjs/testing';

import { type Issuer } from 'openid-client';

import { OIDCAuthGuard } from 'src/engine/core-modules/auth/guards/oidc-auth.guard';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { type SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import { type WorkspaceSSOIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

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
  let guard: OIDCAuthGuard;
  let sSOService: SSOService;
  let guardRedirectService: GuardRedirectService;
  let mockExecutionContext: ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OIDCAuthGuard,
        {
          provide: SSOService,
          useValue: {
            findSSOIdentityProviderById: jest.fn(),
            getOIDCClient: jest.fn(),
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

    guard = module.get<OIDCAuthGuard>(OIDCAuthGuard);
    sSOService = module.get<SSOService>(SSOService);
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

    jest.spyOn(sSOService, 'findSSOIdentityProviderById').mockResolvedValue({
      id: 'test-id',
      issuer: 'https://issuer.example.com',
      workspace: {},
    } as SSOConfiguration & WorkspaceSSOIdentityProviderEntity);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(guardRedirectService.dispatchErrorFromGuard).not.toHaveBeenCalled();
    expect(sSOService.findSSOIdentityProviderById).toHaveBeenCalledWith(
      'test-id',
    );
  });

  it('should throw error when identity provider is not found', async () => {
    const mockedRequest = createMockedRequest({
      identityProviderId: 'non-existent-id',
    });

    mockExecutionContext = createMockExecutionContext(mockedRequest);

    jest
      .spyOn(sSOService, 'findSSOIdentityProviderById')
      .mockResolvedValue(null);

    await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(false);
    expect(sSOService.findSSOIdentityProviderById).toHaveBeenCalledWith(
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
      .spyOn(sSOService, 'findSSOIdentityProviderById')
      .mockResolvedValue(null);

    await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(false);
    expect(guardRedirectService.dispatchErrorFromGuard).toHaveBeenCalled();
  });
});
