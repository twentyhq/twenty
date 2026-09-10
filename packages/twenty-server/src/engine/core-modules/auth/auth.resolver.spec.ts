import { type CanActivate, Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { ImpersonationAuthorizationService } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { SsoExchangeTokenService } from 'src/engine/core-modules/auth/token/services/sso-exchange-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { CaptchaGuard } from 'src/engine/core-modules/captcha/captcha.guard';
import { EmailPasswordResetLinkInput } from 'src/engine/core-modules/auth/dto/email-password-reset-link.input';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { SsoService } from 'src/engine/core-modules/sso/services/sso.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

import { AuthResolver } from './auth.resolver';

import { AuthService } from './services/auth.service';
import { ResetPasswordService } from './services/reset-password.service';
import { EmailVerificationTokenService } from './token/services/email-verification-token.service';
import { LoginTokenService } from './token/services/login-token.service';
import { RenewTokenService } from './token/services/renew-token.service';
import { TransientTokenService } from './token/services/transient-token.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let appTokenRepository: { remove: jest.Mock };
  let authService: {
    checkAccessForSignIn: jest.Mock;
    findWorkspaceForSignInUp: jest.Mock;
    formatUserDataPayload: jest.Mock;
    signInUp: jest.Mock;
  };
  let emailVerificationService: { sendVerificationEmail: jest.Mock };
  let emailVerificationTokenService: {
    validateEmailVerificationTokenOrThrow: jest.Mock;
  };
  let loginTokenService: { generateLoginToken: jest.Mock };
  let resetPasswordService: ResetPasswordService;
  let signInUpService: { signUpOnNewWorkspace: jest.Mock };
  let throttlerService: ThrottlerService;
  let userService: {
    findUserByEmail: jest.Mock;
    findUserByIdOrThrow: jest.Mock;
    markEmailAsVerified: jest.Mock;
  };
  let workspaceDomainsService: {
    buildWorkspaceURL: jest.Mock;
    getWorkspaceByOriginOrDefaultWorkspace: jest.Mock;
    getWorkspaceUrls: jest.Mock;
  };
  const mock_CaptchaGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: {
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {
            checkAccessForSignIn: jest.fn(),
            findWorkspaceForSignInUp: jest.fn(),
            formatUserDataPayload: jest.fn(),
            signInUp: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {
            findUserByEmail: jest.fn(),
            findUserByIdOrThrow: jest.fn(),
            markEmailAsVerified: jest.fn(),
          },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            buildWorkspaceURL: jest
              .fn()
              .mockResolvedValue(new URL('http://localhost:3001')),
            getWorkspaceByOriginOrDefaultWorkspace: jest.fn(),
            getWorkspaceUrls: jest.fn(),
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
          provide: UserSessionService,
          useValue: {
            issueSessionForTokenPair: jest.fn(),
          },
        },
        {
          provide: UserSessionCookieService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            findAvailableWorkspacesByEmail: jest.fn(),
            findFirstWorkspaceByUserId: jest.fn(),
            setLoginTokenToAvailableWorkspacesWhenAuthProviderMatch: jest.fn(),
          },
        },
        {
          provide: RenewTokenService,
          useValue: {},
        },
        {
          provide: SignInUpService,
          useValue: {
            signUpOnNewWorkspace: jest.fn(),
          },
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
          useValue: {
            generateAndSendPasswordResetLink: jest
              .fn()
              .mockResolvedValue(undefined),
          },
        },
        {
          provide: ThrottlerService,
          useValue: {
            tokenBucketThrottleOrThrow: jest.fn(),
          },
        },
        {
          provide: LoginTokenService,
          useValue: {
            generateLoginToken: jest.fn(),
          },
        },
        {
          provide: WorkspaceAgnosticTokenService,
          useValue: {
            generateWorkspaceAgnosticToken: jest.fn(),
          },
        },
        {
          provide: SsoExchangeTokenService,
          useValue: {},
        },
        {
          provide: TransientTokenService,
          useValue: {},
        },
        {
          provide: EmailVerificationService,
          useValue: {
            sendVerificationEmail: jest.fn(),
          },
        },
        {
          provide: EmailVerificationTokenService,
          useValue: {
            validateEmailVerificationTokenOrThrow: jest.fn(),
          },
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
          provide: SsoService,
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
    appTokenRepository = module.get(getRepositoryToken(AppTokenEntity));
    authService = module.get(AuthService);
    emailVerificationService = module.get(EmailVerificationService);
    emailVerificationTokenService = module.get(EmailVerificationTokenService);
    loginTokenService = module.get(LoginTokenService);
    resetPasswordService =
      module.get<ResetPasswordService>(ResetPasswordService);
    signInUpService = module.get(SignInUpService);
    throttlerService = module.get<ThrottlerService>(ThrottlerService);
    userService = module.get(UserService);
    workspaceDomainsService = module.get(WorkspaceDomainsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('password authentication provider propagation', () => {
    const user = { id: 'user-id', email: 'test@example.com' };
    const workspace = { id: 'workspace-id' };
    const loginToken = {
      token: 'login-token',
      expiresAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    it('uses the password provider when verifying an email on a workspace domain', async () => {
      const appToken = { user, context: {} };

      emailVerificationTokenService.validateEmailVerificationTokenOrThrow.mockResolvedValue(
        appToken,
      );
      userService.markEmailAsVerified.mockResolvedValue(user);
      workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace.mockResolvedValue(
        workspace,
      );
      workspaceDomainsService.getWorkspaceUrls.mockReturnValue({
        subdomainUrl: 'https://workspace.example.com',
      });
      loginTokenService.generateLoginToken.mockResolvedValue(loginToken);

      await resolver.verifyEmailAndGetLoginToken(
        {
          email: user.email,
          emailVerificationToken: 'email-verification-token',
        },
        'https://workspace.example.com',
      );

      expect(loginTokenService.generateLoginToken).toHaveBeenCalledWith(
        user.email,
        workspace.id,
        AuthProviderEnum.Password,
      );
      expect(appTokenRepository.remove).toHaveBeenCalledWith(appToken);
    });

    it('uses the password provider when signing up in a workspace', async () => {
      authService.findWorkspaceForSignInUp.mockResolvedValue(workspace);
      userService.findUserByEmail.mockResolvedValue(null);
      authService.formatUserDataPayload.mockReturnValue({
        userData: { type: 'newUser' },
      });
      authService.signInUp.mockResolvedValue({ user, workspace });
      loginTokenService.generateLoginToken.mockResolvedValue(loginToken);
      workspaceDomainsService.getWorkspaceUrls.mockReturnValue({
        subdomainUrl: 'https://workspace.example.com',
      });

      await resolver.signUpInWorkspace({
        email: user.email,
        password: 'password',
      });

      expect(emailVerificationService.sendVerificationEmail).toHaveBeenCalled();
      expect(loginTokenService.generateLoginToken).toHaveBeenCalledWith(
        user.email,
        workspace.id,
        AuthProviderEnum.Password,
      );
    });

    it('rejects a missing provider before creating a new workspace', async () => {
      let caughtError: unknown;

      try {
        await resolver.signUpInNewWorkspace(
          { id: user.id } as never,
          undefined as never,
        );
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).toMatchObject({
        code: AuthExceptionCode.UNAUTHENTICATED,
      });

      expect(userService.findUserByIdOrThrow).not.toHaveBeenCalled();
      expect(signInUpService.signUpOnNewWorkspace).not.toHaveBeenCalled();
    });
  });

  describe('emailPasswordResetLink', () => {
    const emailPasswordResetInput = {
      email: 'test@example.com',
      workspaceId: 'workspace-id',
    } as EmailPasswordResetLinkInput;
    const context = { req: { locale: 'en' } } as I18nContext;

    it('should send the password reset link and return success', async () => {
      const result = await resolver.emailPasswordResetLink(
        emailPasswordResetInput,
        context,
      );

      expect(result).toEqual({ success: true });
      expect(
        resetPasswordService.generateAndSendPasswordResetLink,
      ).toHaveBeenCalledWith({
        email: 'test@example.com',
        workspaceId: 'workspace-id',
        locale: 'en',
      });
    });

    it('should return success without waiting for the link to be sent', async () => {
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      (
        resetPasswordService.generateAndSendPasswordResetLink as jest.Mock
      ).mockRejectedValue(new Error('database down'));

      const result = await resolver.emailPasswordResetLink(
        emailPasswordResetInput,
        context,
      );

      expect(result).toEqual({ success: true });
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to send the password reset link',
        expect.any(Error),
      );
    });

    it('should throttle and send with a normalized email address', async () => {
      await resolver.emailPasswordResetLink(
        {
          email: 'TeSt@Example.com',
        } as EmailPasswordResetLinkInput,
        context,
      );

      expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenCalledWith(
        'password-reset-email:test@example.com',
        1,
        expect.any(Number),
        expect.any(Number),
      );
      expect(
        resetPasswordService.generateAndSendPasswordResetLink,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' }),
      );
    });

    it('should surface the throttling error without sending the link', async () => {
      (
        throttlerService.tokenBucketThrottleOrThrow as jest.Mock
      ).mockRejectedValue(
        new ThrottlerException(
          'Limit reached',
          ThrottlerExceptionCode.LIMIT_REACHED,
        ),
      );

      await expect(
        resolver.emailPasswordResetLink(emailPasswordResetInput, context),
      ).rejects.toThrow(ThrottlerException);
      expect(
        resetPasswordService.generateAndSendPasswordResetLink,
      ).not.toHaveBeenCalled();
    });

    it('should rethrow non throttling errors', async () => {
      (
        throttlerService.tokenBucketThrottleOrThrow as jest.Mock
      ).mockRejectedValue(new Error('cache down'));

      await expect(
        resolver.emailPasswordResetLink(emailPasswordResetInput, context),
      ).rejects.toThrow('cache down');
      expect(
        resetPasswordService.generateAndSendPasswordResetLink,
      ).not.toHaveBeenCalled();
    });
  });
});
