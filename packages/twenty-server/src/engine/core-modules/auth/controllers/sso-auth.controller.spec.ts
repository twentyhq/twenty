import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { type AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { SsoAuthController } from 'src/engine/core-modules/auth/controllers/sso-auth.controller';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { EnterpriseFeaturesEnabledGuard } from 'src/engine/core-modules/auth/guards/enterprise-features-enabled.guard';
import { OidcAuthGuard } from 'src/engine/core-modules/auth/guards/oidc-auth.guard';
import { SamlAuthGuard } from 'src/engine/core-modules/auth/guards/saml-auth.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { type SamlRequest } from 'src/engine/core-modules/auth/strategies/saml.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SsoService } from 'src/engine/core-modules/sso/services/sso.service';
import {
  IdentityProviderType,
  SsoIdentityProviderStatus,
  WorkspaceSsoIdentityProviderEntity,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

const WORKSPACE_ID = 'workspace-id';
const IDENTITY_PROVIDER_ID = 'identity-provider-id';
const EMAIL = 'user@example.com';

const workspace = { id: WORKSPACE_ID };

const identityProvider = {
  id: IDENTITY_PROVIDER_ID,
  type: IdentityProviderType.SAML,
  status: SsoIdentityProviderStatus.Active,
  workspaceId: WORKSPACE_ID,
  workspace,
};

const buildSamlRequest = () =>
  ({
    user: { identityProviderId: IDENTITY_PROVIDER_ID, email: EMAIL },
  }) as SamlRequest;

const buildResponse = () => ({ redirect: jest.fn() });

describe('SsoAuthController', () => {
  let controller: SsoAuthController;
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SsoAuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            findWorkspaceForSignInUp: jest.fn().mockResolvedValue(workspace),
            findInvitationForSignInUp: jest.fn().mockResolvedValue(undefined),
            formatUserDataPayload: jest.fn((newUserPayload, existingUser) => ({
              userData: existingUser
                ? { type: 'existingUser', existingUser }
                : { type: 'newUser', newUserPayload },
            })),
            checkAccessForSignIn: jest.fn().mockResolvedValue(undefined),
            signInUp: jest.fn(),
            createSsoConnectedAccountIfFeatureFlagIsOn: jest
              .fn()
              .mockResolvedValue(undefined),
            computeRedirectURI: jest.fn().mockReturnValue('https://redirect'),
          },
        },
        {
          provide: UserService,
          useValue: {
            findUserByEmail: jest.fn(),
            hasUserAccessToWorkspaceOrThrow: jest
              .fn()
              .mockResolvedValue(undefined),
            markEmailAsVerified: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: LoginTokenService,
          useValue: {
            generateLoginToken: jest
              .fn()
              .mockResolvedValue({ token: 'login-token' }),
          },
        },
        {
          provide: GuardRedirectService,
          useValue: {
            getRedirectErrorUrlAndCaptureExceptions: jest.fn(
              ({ error }: { error: Error }) =>
                `https://verify?errorMessage=${error.message}`,
            ),
          },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain:
              jest.fn(),
          },
        },
        { provide: SsoService, useValue: {} },
        {
          provide: getRepositoryToken(WorkspaceSsoIdentityProviderEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue(identityProvider),
          } as Partial<Repository<WorkspaceSsoIdentityProviderEntity>>,
        },
      ],
    })
      .overrideGuard(EnterpriseFeaturesEnabledGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SamlAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(OidcAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PublicEndpointGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(NoPermissionGuard)
      .useValue({ canActivate: () => true })
      .overrideFilter(AuthRestApiExceptionFilter)
      .useValue({ catch: jest.fn() })
      .compile();

    controller = module.get(SsoAuthController);
    authService = module.get(AuthService);
    userService = module.get(UserService);
  });

  it('marks an existing password-less unverified user as verified after an SSO sign-in', async () => {
    const existingUser = {
      id: 'existing-user-id',
      email: EMAIL,
      isEmailVerified: false,
    } as UserEntity;

    userService.findUserByEmail.mockResolvedValue(existingUser);
    authService.signInUp.mockResolvedValue({
      workspace,
      user: existingUser,
    } as Awaited<ReturnType<AuthService['signInUp']>>);

    const response = buildResponse();

    await controller.samlAuthCallback(buildSamlRequest(), response);

    expect(userService.markEmailAsVerified).toHaveBeenCalledWith(
      existingUser.id,
    );
    expect(response.redirect).toHaveBeenCalledWith('https://redirect');
  });

  it('does not mark an existing unverified user who has a password', async () => {
    const existingUser = {
      id: 'existing-user-id',
      email: EMAIL,
      isEmailVerified: false,
      passwordHash: 'password-hash',
    } as UserEntity;

    userService.findUserByEmail.mockResolvedValue(existingUser);
    authService.signInUp.mockResolvedValue({
      workspace,
      user: existingUser,
    } as Awaited<ReturnType<AuthService['signInUp']>>);

    await controller.samlAuthCallback(buildSamlRequest(), buildResponse());

    expect(userService.markEmailAsVerified).not.toHaveBeenCalled();
  });

  describe('existing account that is not a member', () => {
    const existingUser = {
      id: 'existing-user-id',
      email: EMAIL,
      isEmailVerified: true,
      canAccessFullAdminPanel: false,
      canImpersonate: false,
    } as UserEntity;

    const invitation = {
      id: 'invitation-id',
      value: 'personal-invite-token',
      context: { email: EMAIL },
    } as AppTokenEntity;

    const buildSamlRequestWithInviteToken = (token?: string) =>
      ({
        user: {
          identityProviderId: IDENTITY_PROVIDER_ID,
          email: EMAIL,
          workspacePersonalInviteToken: token,
        },
      }) as SamlRequest;

    beforeEach(() => {
      userService.findUserByEmail.mockResolvedValue(existingUser);
      userService.hasUserAccessToWorkspaceOrThrow.mockRejectedValue(
        new Error('User does not have access to this workspace'),
      );
      authService.signInUp.mockResolvedValue({
        workspace,
        user: existingUser,
      } as Awaited<ReturnType<AuthService['signInUp']>>);
    });

    it('joins through a personal invitation matching the token and the asserted email', async () => {
      authService.findInvitationForSignInUp.mockResolvedValue(invitation);

      const response = buildResponse();

      await controller.samlAuthCallback(
        buildSamlRequestWithInviteToken('personal-invite-token'),
        response,
      );

      expect(authService.findInvitationForSignInUp).toHaveBeenCalledWith({
        currentWorkspace: workspace,
        workspacePersonalInviteToken: 'personal-invite-token',
      });
      expect(
        userService.hasUserAccessToWorkspaceOrThrow,
      ).not.toHaveBeenCalled();
      expect(authService.signInUp).toHaveBeenCalledWith(
        expect.objectContaining({ invitation }),
      );
      expect(response.redirect).toHaveBeenCalledWith('https://redirect');
    });

    it('ignores a personal invitation issued for another email', async () => {
      authService.findInvitationForSignInUp.mockResolvedValue({
        ...invitation,
        context: { email: 'someone-else@example.com' },
      } as AppTokenEntity);

      await controller.samlAuthCallback(
        buildSamlRequestWithInviteToken('personal-invite-token'),
        buildResponse(),
      );

      expect(userService.hasUserAccessToWorkspaceOrThrow).toHaveBeenCalled();
      expect(authService.signInUp).not.toHaveBeenCalled();
    });

    it('does not look up an invitation without a token', async () => {
      await controller.samlAuthCallback(
        buildSamlRequestWithInviteToken(undefined),
        buildResponse(),
      );

      expect(authService.findInvitationForSignInUp).not.toHaveBeenCalled();
      expect(authService.signInUp).not.toHaveBeenCalled();
    });

    it('refuses an account with instance privileges holding a matching invitation with an explicit message', async () => {
      userService.findUserByEmail.mockResolvedValue({
        ...existingUser,
        canAccessFullAdminPanel: true,
      } as UserEntity);
      authService.findInvitationForSignInUp.mockResolvedValue(invitation);

      const response = buildResponse();

      await controller.samlAuthCallback(
        buildSamlRequestWithInviteToken('personal-invite-token'),
        response,
      );

      expect(authService.signInUp).not.toHaveBeenCalled();
      expect(response.redirect).toHaveBeenCalledWith(
        expect.stringContaining(
          'Accounts with admin panel or impersonation access cannot join a workspace through SSO',
        ),
      );
    });

    it('signs in an already-member account with instance privileges holding an invitation', async () => {
      userService.findUserByEmail.mockResolvedValue({
        ...existingUser,
        canImpersonate: true,
      } as UserEntity);
      userService.hasUserAccessToWorkspaceOrThrow.mockResolvedValue(undefined);
      authService.findInvitationForSignInUp.mockResolvedValue(invitation);

      const response = buildResponse();

      await controller.samlAuthCallback(
        buildSamlRequestWithInviteToken('personal-invite-token'),
        response,
      );

      expect(authService.signInUp).toHaveBeenCalledWith(
        expect.objectContaining({ invitation: undefined }),
      );
      expect(response.redirect).toHaveBeenCalledWith('https://redirect');
    });

    it('keeps the generic refusal for an account with a token issued for another email', async () => {
      authService.findInvitationForSignInUp.mockResolvedValue({
        ...invitation,
        context: { email: 'someone-else@example.com' },
      } as AppTokenEntity);

      const response = buildResponse();

      await controller.samlAuthCallback(
        buildSamlRequestWithInviteToken('personal-invite-token'),
        response,
      );

      expect(response.redirect).toHaveBeenCalledWith(
        'https://verify?errorMessage=User does not have access to this workspace',
      );
    });
  });

  it('does not touch an existing user whose email is already verified', async () => {
    const existingUser = {
      id: 'existing-user-id',
      email: EMAIL,
      isEmailVerified: true,
    } as UserEntity;

    userService.findUserByEmail.mockResolvedValue(existingUser);
    authService.signInUp.mockResolvedValue({
      workspace,
      user: existingUser,
    } as Awaited<ReturnType<AuthService['signInUp']>>);

    await controller.samlAuthCallback(buildSamlRequest(), buildResponse());

    expect(userService.markEmailAsVerified).not.toHaveBeenCalled();
  });
});
