import { type Repository } from 'typeorm';

import { type Response } from 'express';

import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { type OIDCRequest } from 'src/engine/core-modules/auth/strategies/oidc.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import {
  IdentityProviderType,
  SSOIdentityProviderStatus,
  type WorkspaceSSOIdentityProviderEntity,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';

import { SSOAuthController } from './sso-auth.controller';

const IDENTITY_PROVIDER_WORKSPACE_ID = 'identity-provider-workspace-id';

describe('SSOAuthController', () => {
  let controller: SSOAuthController;
  let loginTokenService: jest.Mocked<Partial<LoginTokenService>>;
  let authService: jest.Mocked<Partial<AuthService>>;
  let guardRedirectService: jest.Mocked<Partial<GuardRedirectService>>;
  let workspaceDomainsService: jest.Mocked<Partial<WorkspaceDomainsService>>;
  let userService: jest.Mocked<Partial<UserService>>;
  let workspaceSSOIdentityProviderRepository: { findOne: jest.Mock };

  const buildResponse = () => ({ redirect: jest.fn() }) as unknown as Response;

  const buildRequest = (workspaceInviteHash?: string) =>
    ({
      user: {
        identityProviderId: 'identity-provider-id',
        email: 'user@workspace.example',
        workspaceInviteHash,
      },
    }) as unknown as OIDCRequest;

  beforeEach(() => {
    loginTokenService = {
      generateLoginToken: jest.fn().mockResolvedValue({ token: 'login-token' }),
    };
    authService = {
      findWorkspaceForSignInUp: jest.fn(),
      findInvitationForSignInUp: jest.fn().mockResolvedValue(undefined),
      formatUserDataPayload: jest.fn().mockReturnValue({
        userData: { type: 'newUser', newUserPayload: {} },
      }),
      checkAccessForSignIn: jest.fn().mockResolvedValue(undefined),
      signInUp: jest.fn().mockResolvedValue({
        workspace: { id: IDENTITY_PROVIDER_WORKSPACE_ID },
        user: { id: 'user-id', email: 'user@workspace.example' },
      }),
      createSSOConnectedAccountIfFeatureFlagIsOn: jest
        .fn()
        .mockResolvedValue(undefined),
      computeRedirectURI: jest.fn().mockReturnValue('https://success.example'),
    };
    guardRedirectService = {
      getRedirectErrorUrlAndCaptureExceptions: jest
        .fn()
        .mockReturnValue('https://error.example'),
    };
    workspaceDomainsService = {
      getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain: jest
        .fn()
        .mockReturnValue({}),
    };
    userService = {
      findUserByEmail: jest.fn().mockResolvedValue(null),
    };
    workspaceSSOIdentityProviderRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'identity-provider-id',
        workspaceId: IDENTITY_PROVIDER_WORKSPACE_ID,
        type: IdentityProviderType.SAML,
        status: SSOIdentityProviderStatus.Active,
        workspace: { id: IDENTITY_PROVIDER_WORKSPACE_ID },
      }),
    };

    controller = new SSOAuthController(
      loginTokenService as unknown as LoginTokenService,
      authService as unknown as AuthService,
      guardRedirectService as unknown as GuardRedirectService,
      workspaceDomainsService as unknown as WorkspaceDomainsService,
      userService as unknown as UserService,
      {} as unknown as SSOService,
      workspaceSSOIdentityProviderRepository as unknown as Repository<WorkspaceSSOIdentityProviderEntity>,
    );
  });

  it('redirects to an error when the invite hash resolves a workspace other than the identity provider workspace', async () => {
    (authService.findWorkspaceForSignInUp as jest.Mock).mockResolvedValue({
      id: 'victim-workspace-id',
    });

    const res = buildResponse();

    await controller.oidcAuthCallback(buildRequest('victim-invite-hash'), res);

    expect(
      guardRedirectService.getRedirectErrorUrlAndCaptureExceptions,
    ).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('https://error.example');
    expect(authService.signInUp).not.toHaveBeenCalled();
    expect(authService.computeRedirectURI).not.toHaveBeenCalled();
  });

  it('completes sign-in when the resolved workspace belongs to the identity provider', async () => {
    (authService.findWorkspaceForSignInUp as jest.Mock).mockResolvedValue({
      id: IDENTITY_PROVIDER_WORKSPACE_ID,
      approvedAccessDomains: [],
    });

    const res = buildResponse();

    await controller.oidcAuthCallback(buildRequest(), res);

    expect(authService.signInUp).toHaveBeenCalledTimes(1);
    expect(authService.computeRedirectURI).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('https://success.example');
  });

  it('redirects to an error when the authenticating identity provider is not active', async () => {
    workspaceSSOIdentityProviderRepository.findOne.mockResolvedValue({
      id: 'identity-provider-id',
      workspaceId: IDENTITY_PROVIDER_WORKSPACE_ID,
      type: IdentityProviderType.SAML,
      status: SSOIdentityProviderStatus.Inactive,
      workspace: { id: IDENTITY_PROVIDER_WORKSPACE_ID },
    });

    const res = buildResponse();

    await controller.oidcAuthCallback(buildRequest(), res);

    expect(
      guardRedirectService.getRedirectErrorUrlAndCaptureExceptions,
    ).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('https://error.example');
    expect(authService.findWorkspaceForSignInUp).not.toHaveBeenCalled();
    expect(authService.signInUp).not.toHaveBeenCalled();
  });
});
