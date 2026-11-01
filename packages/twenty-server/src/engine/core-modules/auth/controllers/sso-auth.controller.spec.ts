import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Response } from 'express';
import { type Repository } from 'typeorm';

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

const buildResponse = () => ({ redirect: jest.fn() }) as unknown as Response;

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
        { provide: GuardRedirectService, useValue: {} },
        { provide: WorkspaceDomainsService, useValue: {} },
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

  it('creates a new SSO user with an already verified email', async () => {
    const createdUser = {
      id: 'new-user-id',
      email: EMAIL,
      isEmailVerified: true,
    } as UserEntity;

    userService.findUserByEmail.mockResolvedValue(null);
    authService.signInUp.mockResolvedValue({
      workspace,
      user: createdUser,
    } as Awaited<ReturnType<AuthService['signInUp']>>);

    const response = buildResponse();

    await controller.samlAuthCallback(buildSamlRequest(), response);

    expect(authService.formatUserDataPayload).toHaveBeenCalledWith(
      expect.objectContaining({ email: EMAIL, isEmailAlreadyVerified: true }),
      null,
    );
    expect(userService.markEmailAsVerified).not.toHaveBeenCalled();
    expect(response.redirect).toHaveBeenCalledWith('https://redirect');
  });

  it('marks an existing password-less unverified user as verified after an SSO sign-in', async () => {
    const existingUser = {
      id: 'existing-user-id',
      email: EMAIL,
      isEmailVerified: false,
      passwordHash: null,
    } as unknown as UserEntity;

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
