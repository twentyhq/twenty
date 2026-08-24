import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { AuthSsoService } from 'src/engine/core-modules/auth/services/auth-sso.service';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { CreateSSOConnectedAccountService } from 'src/engine/core-modules/auth/services/create-sso-connected-account.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { SSOExchangeTokenService } from 'src/engine/core-modules/auth/token/services/sso-exchange-token.service';
import { AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context-user.type';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

describe('AuthService.generateAuthorizationCode (RFC 9207)', () => {
  let authService: AuthService;
  let applicationRegistrationService: ApplicationRegistrationService;
  let appTokenRepository: Repository<AppTokenEntity>;
  let twentyConfigService: TwentyConfigService;

  const mockUser: AuthContextUser = {
    id: 'user-id-123',
    email: 'user@example.com',
    userWorkspaceId: 'user-workspace-id-123',
    firstName: 'Jane',
    lastName: 'Doe',
    roles: [],
    locale: 'en',
  };

  const mockWorkspace: WorkspaceEntity = {
    id: 'workspace-id-123',
    subdomain: 'apple',
  } as unknown as WorkspaceEntity;

  const mockAppRegistration: Partial<ApplicationRegistrationEntity> = {
    id: 'app-reg-123',
    oAuthClientId: 'client-123',
    oAuthScopes: ['read', 'write'],
    oAuthRedirectUris: ['https://client.example.com/callback'],
    oAuthClientSecretHash: 'some-secret-hash',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AccessTokenService,
          useValue: {},
        },
        {
          provide: SSOExchangeTokenService,
          useValue: {},
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {},
        },
        {
          provide: DomainServerConfigService,
          useValue: {},
        },
        {
          provide: RefreshTokenService,
          useValue: {},
        },
        {
          provide: LoginTokenService,
          useValue: {},
        },
        {
          provide: GuardRedirectService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {},
        },
        {
          provide: WorkspaceInvitationService,
          useValue: {},
        },
        {
          provide: AuthSsoService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: SignInUpService,
          useValue: {},
        },
        {
          provide: PermissionsService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {},
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'SERVER_URL') return 'https://api.twenty.com';
              return undefined;
            }),
          },
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: I18nService,
          useValue: {},
        },
        {
          provide: EventLogEmitterService,
          useValue: {},
        },
        {
          provide: ApplicationRegistrationService,
          useValue: {
            findOneByClientId: jest.fn(),
          },
        },
        {
          provide: FeatureFlagService,
          useValue: {},
        },
        {
          provide: CreateSSOConnectedAccountService,
          useValue: {},
        },
        {
          provide: UserSessionService,
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    applicationRegistrationService = module.get<ApplicationRegistrationService>(
      ApplicationRegistrationService,
    );
    appTokenRepository = module.get<Repository<AppTokenEntity>>(
      getRepositoryToken(AppTokenEntity),
    );
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  it('includes the iss parameter matching SERVER_URL in the redirect URL (RFC 9207)', async () => {
    jest
      .spyOn(applicationRegistrationService, 'findOneByClientId')
      .mockResolvedValue(mockAppRegistration as ApplicationRegistrationEntity);

    const result = await authService.generateAuthorizationCode(
      {
        clientId: 'client-123',
        redirectUrl: 'https://client.example.com/callback',
        state: 'random-state-xyz',
        scope: 'read',
      },
      mockUser,
      mockWorkspace,
    );

    const parsedRedirectUrl = new URL(result.redirectUrl);

    expect(parsedRedirectUrl.origin).toBe('https://client.example.com');
    expect(parsedRedirectUrl.pathname).toBe('/callback');
    expect(parsedRedirectUrl.searchParams.get('iss')).toBe(
      'https://api.twenty.com',
    );
    expect(parsedRedirectUrl.searchParams.get('code')).toBeDefined();
    expect(parsedRedirectUrl.searchParams.get('state')).toBe(
      'random-state-xyz',
    );
    expect(appTokenRepository.save).toHaveBeenCalledTimes(1);
  });

  it('includes iss and code without state when state is omitted', async () => {
    jest
      .spyOn(applicationRegistrationService, 'findOneByClientId')
      .mockResolvedValue(mockAppRegistration as ApplicationRegistrationEntity);

    const result = await authService.generateAuthorizationCode(
      {
        clientId: 'client-123',
        redirectUrl: 'https://client.example.com/callback',
      },
      mockUser,
      mockWorkspace,
    );

    const parsedRedirectUrl = new URL(result.redirectUrl);

    expect(parsedRedirectUrl.searchParams.get('iss')).toBe(
      'https://api.twenty.com',
    );
    expect(parsedRedirectUrl.searchParams.get('code')).toBeDefined();
    expect(parsedRedirectUrl.searchParams.get('state')).toBeNull();
  });

  it('strips trailing slash from SERVER_URL when setting iss', async () => {
    jest.spyOn(twentyConfigService, 'get').mockImplementation((key: string) => {
      if (key === 'SERVER_URL') return 'https://api.twenty.com/';
      return undefined;
    });

    jest
      .spyOn(applicationRegistrationService, 'findOneByClientId')
      .mockResolvedValue(mockAppRegistration as ApplicationRegistrationEntity);

    const result = await authService.generateAuthorizationCode(
      {
        clientId: 'client-123',
        redirectUrl: 'https://client.example.com/callback',
      },
      mockUser,
      mockWorkspace,
    );

    const parsedRedirectUrl = new URL(result.redirectUrl);

    expect(parsedRedirectUrl.searchParams.get('iss')).toBe(
      'https://api.twenty.com',
    );
  });

  it('supports public clients with PKCE code_challenge and loopback redirect URIs', async () => {
    const publicAppRegistration: Partial<ApplicationRegistrationEntity> = {
      id: 'public-reg-123',
      oAuthClientId: 'public-client-123',
      oAuthScopes: ['read'],
      oAuthRedirectUris: [],
      oAuthClientSecretHash: undefined,
    };

    jest
      .spyOn(applicationRegistrationService, 'findOneByClientId')
      .mockResolvedValue(
        publicAppRegistration as ApplicationRegistrationEntity,
      );

    const result = await authService.generateAuthorizationCode(
      {
        clientId: 'public-client-123',
        redirectUrl: 'http://127.0.0.1:8080/callback',
        codeChallenge: 'E9Melhoa2OwvFrGMTJguCH5rtx64NetqiCSTbZ7bkqk',
        state: 'pkce-state',
      },
      mockUser,
      mockWorkspace,
    );

    const parsedRedirectUrl = new URL(result.redirectUrl);

    expect(parsedRedirectUrl.searchParams.get('iss')).toBe(
      'https://api.twenty.com',
    );
    expect(parsedRedirectUrl.searchParams.get('code')).toBeDefined();
    expect(parsedRedirectUrl.searchParams.get('state')).toBe('pkce-state');
  });
});
