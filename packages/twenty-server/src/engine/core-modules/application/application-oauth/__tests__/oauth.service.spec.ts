import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { type ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { OAuthService } from 'src/engine/core-modules/application/application-oauth/oauth.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

describe('OAuthService', () => {
  let service: OAuthService;

  const clientId = 'client-1';
  const clientSecret = 'client-secret';
  const userId = 'user-1';
  const workspaceId = 'workspace-1';
  const userWorkspaceId = 'user-workspace-1';
  const applicationId = 'application-1';
  const applicationRegistrationId = 'application-registration-1';
  const redirectUri = 'https://app.example.com/callback';
  const authorizationId = 'authorization-1';

  const applicationRegistration = {
    id: applicationRegistrationId,
    name: 'Example',
    universalIdentifier: 'example',
    latestAvailableVersion: '1.0.0',
    oAuthClientSecretHash: 'hash',
    oAuthScopes: ['api', 'profile'],
  };

  const application = {
    id: applicationId,
    workspaceId,
    applicationRegistrationId,
  };

  const refreshTokenPayload = {
    sub: applicationId,
    type: JwtTokenTypeEnum.APPLICATION_REFRESH,
    applicationId,
    workspaceId,
    userWorkspaceId,
    userId,
  };

  const appTokenRepository = { findOne: jest.fn(), update: jest.fn() };
  const applicationRepository = { find: jest.fn(), findOne: jest.fn() };
  const userWorkspaceRepository = { findOne: jest.fn() };

  const applicationTokenService = {
    generateApplicationTokenPair: jest.fn(),
    generateApplicationAccessToken: jest.fn(),
    validateApplicationRefreshToken: jest.fn(),
    validateApplicationAccessToken: jest.fn(),
    renewApplicationTokens: jest.fn(),
    decodeToken: jest.fn(),
  };

  const applicationAuthorizationService = {
    recordAuthorization: jest.fn(),
    findByUserAndApplication: jest.fn(),
    touchLastUsedAt: jest.fn(),
    revokeAuthorizationForApplication: jest.fn(),
  };

  const applicationRegistrationService = {
    findOneByClientId: jest.fn(),
    verifyClientSecret: jest.fn(),
  };

  const buildAuthorization = (
    overrides: Partial<ApplicationAuthorizationEntity> = {},
  ): ApplicationAuthorizationEntity =>
    ({
      id: authorizationId,
      userId,
      workspaceId,
      userWorkspaceId,
      applicationId,
      scopes: ['api'],
      revokedAt: null,
      ...overrides,
    }) as ApplicationAuthorizationEntity;

  beforeEach(async () => {
    jest.clearAllMocks();

    applicationRegistrationService.findOneByClientId.mockResolvedValue(
      applicationRegistration,
    );
    applicationRegistrationService.verifyClientSecret.mockResolvedValue(true);
    applicationRepository.findOne.mockResolvedValue(application);
    userWorkspaceRepository.findOne.mockResolvedValue({ id: userWorkspaceId });
    applicationTokenService.generateApplicationTokenPair.mockResolvedValue({
      applicationAccessToken: { token: 'access-token', expiresAt: new Date() },
      applicationRefreshToken: {
        token: 'refresh-token',
        expiresAt: new Date(),
      },
    });
    applicationTokenService.renewApplicationTokens.mockResolvedValue({
      applicationAccessToken: { token: 'access-token', expiresAt: new Date() },
      applicationRefreshToken: {
        token: 'refresh-token',
        expiresAt: new Date(),
      },
    });
    applicationTokenService.validateApplicationRefreshToken.mockResolvedValue(
      refreshTokenPayload,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: appTokenRepository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: applicationRepository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
        {
          provide: ApplicationTokenService,
          useValue: applicationTokenService,
        },
        {
          provide: ApplicationAuthorizationService,
          useValue: applicationAuthorizationService,
        },
        {
          provide: ApplicationRegistrationService,
          useValue: applicationRegistrationService,
        },
        { provide: ApplicationService, useValue: { create: jest.fn() } },
        {
          provide: ApplicationInstallService,
          useValue: { installApplication: jest.fn() },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn(() => '30m') },
        },
      ],
    }).compile();

    service = module.get(OAuthService);
  });

  describe('exchangeAuthorizationCode', () => {
    const exchange = () =>
      service.exchangeAuthorizationCode({
        authorizationCode: 'code',
        clientId,
        clientSecret,
        redirectUri,
      });

    beforeEach(() => {
      appTokenRepository.findOne.mockResolvedValue({
        id: 'app-token-1',
        userId,
        workspaceId,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60 * 1000),
        context: { clientId, redirectUri, scope: 'api profile' },
      });
    });

    it('should record the authorization with the granted scopes', async () => {
      await exchange();

      expect(
        applicationAuthorizationService.recordAuthorization,
      ).toHaveBeenCalledWith({
        userId,
        workspaceId,
        userWorkspaceId,
        applicationId,
        scopes: ['api', 'profile'],
      });
    });

    it('should record the authorization before issuing the token pair', async () => {
      await exchange();

      expect(
        applicationAuthorizationService.recordAuthorization.mock
          .invocationCallOrder[0],
      ).toBeLessThan(
        applicationTokenService.generateApplicationTokenPair.mock
          .invocationCallOrder[0],
      );
    });

    it('should record no scopes when the authorization carried an empty scope', async () => {
      appTokenRepository.findOne.mockResolvedValue({
        id: 'app-token-1',
        userId,
        workspaceId,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60 * 1000),
        context: { clientId, redirectUri, scope: '' },
      });

      await exchange();

      expect(
        applicationAuthorizationService.recordAuthorization,
      ).toHaveBeenCalledWith(expect.objectContaining({ scopes: [] }));
    });
  });

  describe('refreshTokenGrant', () => {
    const refresh = () =>
      service.refreshTokenGrant({
        refreshToken: 'refresh-token',
        clientId,
        clientSecret,
      });

    it('should refuse to renew once the user revoked the application', async () => {
      applicationAuthorizationService.findByUserAndApplication.mockResolvedValue(
        buildAuthorization({ revokedAt: new Date() }),
      );

      const result = await refresh();

      expect(result).toEqual(
        expect.objectContaining({ error: 'invalid_grant' }),
      );
      expect(
        applicationTokenService.renewApplicationTokens,
      ).not.toHaveBeenCalled();
    });

    it('should renew and touch the authorization when it is still live', async () => {
      applicationAuthorizationService.findByUserAndApplication.mockResolvedValue(
        buildAuthorization(),
      );

      const result = await refresh();

      expect(result).toEqual(
        expect.objectContaining({ access_token: 'access-token' }),
      );
      expect(
        applicationAuthorizationService.touchLastUsedAt,
      ).toHaveBeenCalledWith(authorizationId);
    });

    it('should write the missing grant for a refresh token issued before authorizations were recorded', async () => {
      applicationAuthorizationService.findByUserAndApplication.mockResolvedValue(
        null,
      );

      const result = await refresh();

      expect(
        applicationAuthorizationService.recordAuthorization,
      ).toHaveBeenCalledWith({
        userId,
        workspaceId,
        userWorkspaceId,
        applicationId,
        scopes: ['api', 'profile'],
      });
      expect(result).toEqual(
        expect.objectContaining({ access_token: 'access-token' }),
      );
    });

    it('should refuse to renew when the user is no longer a member of the workspace', async () => {
      applicationAuthorizationService.findByUserAndApplication.mockResolvedValue(
        null,
      );
      userWorkspaceRepository.findOne.mockResolvedValue(null);

      const result = await refresh();

      expect(result).toEqual(
        expect.objectContaining({ error: 'invalid_grant' }),
      );
      expect(
        applicationAuthorizationService.recordAuthorization,
      ).not.toHaveBeenCalled();
    });

    it('should not look for an authorization when the token carries no user', async () => {
      applicationTokenService.validateApplicationRefreshToken.mockResolvedValue(
        {
          ...refreshTokenPayload,
          userId: undefined,
          userWorkspaceId: undefined,
        },
      );

      const result = await refresh();

      expect(
        applicationAuthorizationService.findByUserAndApplication,
      ).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({ access_token: 'access-token' }),
      );
    });
  });

  describe('revokeToken', () => {
    it('should revoke the underlying authorization', async () => {
      const result = await service.revokeToken({
        token: 'refresh-token',
        clientId,
        clientSecret,
      });

      expect(
        applicationAuthorizationService.revokeAuthorizationForApplication,
      ).toHaveBeenCalledWith({ userId, applicationId });
      expect(result).toEqual({ success: true });
    });

    it('should stay a no-op for a token that carries no user', async () => {
      applicationTokenService.validateApplicationRefreshToken.mockResolvedValue(
        {
          ...refreshTokenPayload,
          userId: undefined,
        },
      );

      const result = await service.revokeToken({
        token: 'refresh-token',
        clientId,
        clientSecret,
      });

      expect(
        applicationAuthorizationService.revokeAuthorizationForApplication,
      ).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should refuse to revoke an authorization the asking client was not issued', async () => {
      applicationRepository.findOne.mockResolvedValue({
        ...application,
        applicationRegistrationId: 'another-registration',
      });

      const result = await service.revokeToken({
        token: 'refresh-token',
        clientId,
        clientSecret,
      });

      expect(
        applicationAuthorizationService.revokeAuthorizationForApplication,
      ).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should stay a no-op when the caller did not identify itself as a client', async () => {
      const result = await service.revokeToken({ token: 'refresh-token' });

      expect(
        applicationAuthorizationService.revokeAuthorizationForApplication,
      ).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('introspectToken', () => {
    beforeEach(() => {
      applicationTokenService.decodeToken.mockReturnValue(refreshTokenPayload);
    });

    it('should report a refresh token inactive once its authorization is revoked', async () => {
      applicationAuthorizationService.findByUserAndApplication.mockResolvedValue(
        buildAuthorization({ revokedAt: new Date() }),
      );

      expect(
        await service.introspectToken({
          token: 'refresh-token',
          clientId,
          clientSecret,
        }),
      ).toEqual({ active: false });
    });

    it('should report a refresh token active while its authorization stands', async () => {
      applicationAuthorizationService.findByUserAndApplication.mockResolvedValue(
        buildAuthorization(),
      );

      expect(
        await service.introspectToken({
          token: 'refresh-token',
          clientId,
          clientSecret,
        }),
      ).toEqual(expect.objectContaining({ active: true }));
    });
  });
});
