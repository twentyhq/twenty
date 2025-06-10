import { CanActivate } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CaptchaGuard } from 'src/engine/core-modules/captcha/captcha.guard';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';

import { AuthResolver } from './auth.resolver';

import { ApiKeyService } from './services/api-key.service';
import { AuthService } from './services/auth.service';
// import { OAuthService } from './services/oauth.service';
import { ResetPasswordService } from './services/reset-password.service';
import { EmailVerificationTokenService } from './token/services/email-verification-token.service';
import { LoginTokenService } from './token/services/login-token.service';
import { RenewTokenService } from './token/services/renew-token.service';
import { TransientTokenService } from './token/services/transient-token.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  const mock_CaptchaGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: DomainManagerService,
          useValue: {
            buildWorkspaceURL: jest
              .fn()
              .mockResolvedValue(new URL('http://localhost:3001')),
          },
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
          provide: ResetPasswordService,
          useValue: {},
        },
        {
          provide: LoginTokenService,
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
        // {
        //   provide: OAuthService,
        //   useValue: {},
        // },
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
});
