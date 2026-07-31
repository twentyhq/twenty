import { type CanActivate, Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { ImpersonationAuthorizationService } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { SSOExchangeTokenService } from 'src/engine/core-modules/auth/token/services/sso-exchange-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { CaptchaGuard } from 'src/engine/core-modules/captcha/captcha.guard';
import { EmailPasswordResetLinkInput } from 'src/engine/core-modules/auth/dto/email-password-reset-link.input';
import { EmailPasswordResetLinkJob } from 'src/engine/core-modules/auth/jobs/email-password-reset-link.job';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
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
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
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
  let messageQueueService: MessageQueueService;
  let throttlerService: ThrottlerService;
  const mock_CaptchaGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
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
          useValue: {},
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
          provide: getQueueToken(MessageQueue.emailQueue),
          useValue: {
            add: jest.fn().mockResolvedValue(undefined),
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
          useValue: {},
        },
        {
          provide: WorkspaceAgnosticTokenService,
          useValue: {},
        },
        {
          provide: SSOExchangeTokenService,
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
    messageQueueService = module.get<MessageQueueService>(
      getQueueToken(MessageQueue.emailQueue),
    );
    throttlerService = module.get<ThrottlerService>(ThrottlerService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('emailPasswordResetLink', () => {
    const emailPasswordResetInput = {
      email: 'test@example.com',
      workspaceId: 'workspace-id',
    } as EmailPasswordResetLinkInput;
    const context = { req: { locale: 'en' } } as I18nContext;

    it('should enqueue the password reset link job and return success', async () => {
      const result = await resolver.emailPasswordResetLink(
        emailPasswordResetInput,
        context,
      );

      expect(result).toEqual({ success: true });
      expect(messageQueueService.add).toHaveBeenCalledWith(
        EmailPasswordResetLinkJob.name,
        {
          email: 'test@example.com',
          workspaceId: 'workspace-id',
          locale: 'en',
        },
        { retryLimit: 3 },
      );
    });

    it('should return success without waiting for the job to be enqueued', async () => {
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      (messageQueueService.add as jest.Mock).mockRejectedValue(
        new Error('redis down'),
      );

      const result = await resolver.emailPasswordResetLink(
        emailPasswordResetInput,
        context,
      );

      expect(result).toEqual({ success: true });
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to enqueue the password reset email job',
        expect.any(Error),
      );
    });

    it('should throttle and enqueue with a normalized email address', async () => {
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
      expect(messageQueueService.add).toHaveBeenCalledWith(
        EmailPasswordResetLinkJob.name,
        expect.objectContaining({ email: 'test@example.com' }),
        { retryLimit: 3 },
      );
    });

    it('should surface the throttling error without enqueuing the job', async () => {
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
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('should rethrow non throttling errors', async () => {
      (
        throttlerService.tokenBucketThrottleOrThrow as jest.Mock
      ).mockRejectedValue(new Error('cache down'));

      await expect(
        resolver.emailPasswordResetLink(emailPasswordResetInput, context),
      ).rejects.toThrow('cache down');
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });
  });
});
