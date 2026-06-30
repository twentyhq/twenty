import { type CanActivate } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { ImpersonationAuthorizationService } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { CaptchaGuard } from 'src/engine/core-modules/captcha/captcha.guard';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

import { AuthResolver } from './auth.resolver';

import { AuthException } from './auth.exception';
import { AuthService } from './services/auth.service';
import { ResetPasswordService } from './services/reset-password.service';
import { EmailVerificationTokenService } from './token/services/email-verification-token.service';
import { LoginTokenService } from './token/services/login-token.service';
import { RenewTokenService } from './token/services/renew-token.service';
import { TransientTokenService } from './token/services/transient-token.service';
import { type AuthContextUser } from './types/auth-context.type';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let userWorkspaceRepository: { findOne: jest.Mock };
  let loginTokenService: { generateLoginToken: jest.Mock };
  const mock_CaptchaGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    userWorkspaceRepository = { findOne: jest.fn() };
    loginTokenService = { generateLoginToken: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: RefreshTokenService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            buildWorkspaceURL: jest
              .fn()
              .mockResolvedValue(new URL('http://localhost:3001')),
          },
        },
        {
          provide: SubdomainManagerService,
          useValue: {},
        },
        {
          provide: FileCorePictureService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {},
        },
        {
          provide: RenewTokenService,
          useValue: {},
        },
        {
          provide: SignInUpService,
          useValue: {},
        },
        {
          provide: ApiKeyService,
          useValue: {},
        },
        {
          provide: AccessTokenService,
          useValue: {},
        },
        {
          provide: ResetPasswordService,
          useValue: {},
        },
        {
          provide: LoginTokenService,
          useValue: loginTokenService,
        },
        {
          provide: WorkspaceAgnosticTokenService,
          useValue: {},
        },
        {
          provide: TransientTokenService,
          useValue: {},
        },
        {
          provide: EmailVerificationService,
          useValue: {},
        },
        {
          provide: EmailVerificationTokenService,
          useValue: {},
        },
        {
          provide: ImpersonationAuthorizationService,
          useValue: {},
        },
        {
          provide: PermissionsService,
          useValue: {},
        },
        {
          provide: FeatureFlagService,
          useValue: {},
        },
        {
          provide: SSOService,
          useValue: {},
        },
        {
          provide: TwoFactorAuthenticationService,
          useValue: {},
        },
        {
          provide: TwentyConfigService,
          useValue: {},
        },
        {
          provide: EventLogEmitterService,
          useValue: {
            createContext: jest.fn().mockReturnValue({
              insertWorkspaceEvent: jest.fn(),
            }),
          },
        },
      ],
    })
      .overrideGuard(CaptchaGuard)
      .useValue(mock_CaptchaGuard)
      .compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getLoginTokenForWorkspace', () => {
    const currentUser = {
      id: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      email: 'user@example.com',
    } as AuthContextUser;

    it('should mint a fresh login token for an accessible workspace', async () => {
      userWorkspaceRepository.findOne.mockResolvedValue({
        id: '30303030-1c25-4d02-bf25-6aeccf7ea419',
      });
      loginTokenService.generateLoginToken.mockResolvedValue({
        token: 'fresh-login-token',
        expiresAt: '2026-06-30T08:00:00.000Z',
      });

      const result = await resolver.getLoginTokenForWorkspace(
        currentUser,
        AuthProviderEnum.Password,
        '40404040-1c25-4d02-bf25-6aeccf7ea419',
      );

      expect(userWorkspaceRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: currentUser.id,
          workspaceId: '40404040-1c25-4d02-bf25-6aeccf7ea419',
        },
      });
      expect(loginTokenService.generateLoginToken).toHaveBeenCalledWith(
        currentUser.email,
        '40404040-1c25-4d02-bf25-6aeccf7ea419',
        AuthProviderEnum.Password,
      );
      expect(result).toEqual({
        loginToken: {
          token: 'fresh-login-token',
          expiresAt: '2026-06-30T08:00:00.000Z',
        },
      });
    });

    it('should not mint a login token for an inaccessible workspace', async () => {
      userWorkspaceRepository.findOne.mockResolvedValue(null);

      await expect(
        resolver.getLoginTokenForWorkspace(
          currentUser,
          AuthProviderEnum.Password,
          '40404040-1c25-4d02-bf25-6aeccf7ea419',
        ),
      ).rejects.toThrow(AuthException);

      expect(loginTokenService.generateLoginToken).not.toHaveBeenCalled();
    });
  });
});
