import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { OAuthService } from 'src/engine/core-modules/application/application-oauth/oauth.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

describe('OAuthService', () => {
  let service: OAuthService;
  let appTokenRepository: jest.Mocked<Repository<AppTokenEntity>>;
  let applicationRegistrationService: jest.Mocked<ApplicationRegistrationService>;

  const clientId = 'client-123';
  // A well-formed PKCE verifier so the request would pass the PKCE dimension.
  const codeVerifier = 'a'.repeat(64);

  const buildRegistration = (
    overrides: Partial<ApplicationRegistrationEntity> = {},
  ): ApplicationRegistrationEntity =>
    ({
      id: 'registration-1',
      oAuthClientId: clientId,
      oAuthClientSecretHash: null,
      oAuthScopes: ['read'],
      ...overrides,
    }) as ApplicationRegistrationEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: { findOne: jest.fn(), update: jest.fn() },
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: { findOne: jest.fn(), find: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: ApplicationTokenService,
          useValue: { generateApplicationTokenPair: jest.fn() },
        },
        {
          provide: ApplicationRegistrationService,
          useValue: {
            findOneByClientId: jest.fn(),
            verifyClientSecret: jest.fn(),
          },
        },
        { provide: ApplicationService, useValue: { create: jest.fn() } },
        {
          provide: ApplicationInstallService,
          useValue: { installApplication: jest.fn() },
        },
        { provide: TwentyConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
    appTokenRepository = module.get(getRepositoryToken(AppTokenEntity));
    applicationRegistrationService = module.get(ApplicationRegistrationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exchangeAuthorizationCode - confidential client authentication', () => {
    it('should reject a confidential client that presents only PKCE and no client_secret', async () => {
      // A confidential client is one that was issued a secret (hash stored).
      applicationRegistrationService.findOneByClientId.mockResolvedValue(
        buildRegistration({ oAuthClientSecretHash: 'stored-secret-hash' }),
      );

      const result = await service.exchangeAuthorizationCode({
        authorizationCode: 'auth-code',
        clientId,
        clientSecret: undefined,
        codeVerifier,
        redirectUri: 'https://app.example.com/callback',
      });

      expect(result).toEqual({
        error: 'invalid_client',
        error_description:
          'Client authentication required for confidential clients',
      });
      // The request must be rejected before the authorization code is even
      // looked up — PKCE never gets a chance to substitute for authentication.
      expect(appTokenRepository.findOne).not.toHaveBeenCalled();
    });

    it('should still validate a wrong client_secret for a confidential client', async () => {
      applicationRegistrationService.findOneByClientId.mockResolvedValue(
        buildRegistration({ oAuthClientSecretHash: 'stored-secret-hash' }),
      );
      applicationRegistrationService.verifyClientSecret.mockResolvedValue(
        false,
      );

      const result = await service.exchangeAuthorizationCode({
        authorizationCode: 'auth-code',
        clientId,
        clientSecret: 'wrong-secret',
        codeVerifier,
        redirectUri: 'https://app.example.com/callback',
      });

      expect(result).toEqual({
        error: 'invalid_client',
        error_description: 'Invalid client secret',
      });
    });

    it('should not apply the confidential-client gate to public (PKCE) clients', async () => {
      // Public client: no secret hash. PKCE-only must remain allowed, so the
      // flow proceeds past client authentication to the code lookup.
      applicationRegistrationService.findOneByClientId.mockResolvedValue(
        buildRegistration({ oAuthClientSecretHash: null }),
      );
      appTokenRepository.findOne.mockResolvedValue(null);

      const result = await service.exchangeAuthorizationCode({
        authorizationCode: 'auth-code',
        clientId,
        clientSecret: undefined,
        codeVerifier,
        redirectUri: 'https://app.example.com/callback',
      });

      // Reaches the code lookup (not blocked by the confidential gate).
      expect(appTokenRepository.findOne).toHaveBeenCalledWith({
        where: {
          value: expect.any(String),
          type: AppTokenType.AuthorizationCode,
        },
      });
      expect(result).toEqual({
        error: 'invalid_grant',
        error_description: 'Authorization code not found',
      });
    });
  });
});
