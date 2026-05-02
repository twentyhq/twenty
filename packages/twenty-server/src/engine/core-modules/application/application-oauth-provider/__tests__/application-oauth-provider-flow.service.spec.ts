// SecureHttpClientService transitively depends on `@lifeomic/axios-fetch`,
// which is an optional native-binding dep that's flaky in some test envs.
// We never use the real implementation here (the test always injects a
// mock via `useValue`), so stub the module to avoid loading the dep at all.
jest.mock(
  'src/engine/core-modules/secure-http-client/secure-http-client.service',
  () => ({
    SecureHttpClientService: class {},
  }),
);

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { ApplicationOAuthProviderFlowService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider-flow.service';
import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

describe('ApplicationOAuthProviderFlowService', () => {
  let service: ApplicationOAuthProviderFlowService;
  let oauthProviderService: { findOneByIdOrThrow: jest.Mock };
  let applicationVariableService: { getRawValueByKeyOrThrow: jest.Mock };
  let jwtWrapperService: {
    sign: jest.Mock;
    verifyJwtToken: jest.Mock;
    generateAppSecret: jest.Mock;
  };
  let secureHttpClientService: { createSsrfSafeFetch: jest.Mock };
  let connectedAccountRepository: {
    count: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOneByOrFail: jest.Mock;
  };

  const baseProvider: ApplicationOAuthProviderEntity = {
    id: 'provider-1',
    universalIdentifier: 'provider-uid',
    applicationId: 'app-1',
    workspaceId: 'workspace-1',
    name: 'linear',
    displayName: 'Linear',
    icon: null,
    authorizationEndpoint: 'https://linear.app/oauth/authorize',
    tokenEndpoint: 'https://api.linear.app/oauth/token',
    revokeEndpoint: null,
    scopes: ['read', 'write'],
    clientIdVariable: 'LINEAR_CLIENT_ID',
    clientSecretVariable: 'LINEAR_CLIENT_SECRET',
    authorizationParams: null,
    tokenRequestContentType: 'form-urlencoded',
    usePkce: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as ApplicationOAuthProviderEntity;

  beforeEach(async () => {
    oauthProviderService = { findOneByIdOrThrow: jest.fn() };
    applicationVariableService = { getRawValueByKeyOrThrow: jest.fn() };
    jwtWrapperService = {
      sign: jest.fn(),
      verifyJwtToken: jest.fn(),
      generateAppSecret: jest.fn(() => 'derived-secret'),
    };
    secureHttpClientService = { createSsrfSafeFetch: jest.fn() };
    connectedAccountRepository = {
      count: jest.fn(async () => 0),
      update: jest.fn(),
      create: jest.fn((entity) => entity),
      save: jest.fn(async (entity) => ({ ...entity, id: 'new-account-id' })),
      findOneByOrFail: jest.fn(async ({ id }) => ({
        id,
        provider: ConnectedAccountProvider.APP,
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationOAuthProviderFlowService,
        {
          provide: ApplicationOAuthProviderService,
          useValue: oauthProviderService,
        },
        {
          provide: ApplicationVariableEntityService,
          useValue: applicationVariableService,
        },
        { provide: JwtWrapperService, useValue: jwtWrapperService },
        { provide: SecureHttpClientService, useValue: secureHttpClientService },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn(() => 'https://api.example.com') },
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: connectedAccountRepository,
        },
      ],
    }).compile();

    service = module.get(ApplicationOAuthProviderFlowService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('startAuthorizationFlow', () => {
    it('builds the provider authorization URL with the workspace + scope context signed into state', async () => {
      applicationVariableService.getRawValueByKeyOrThrow.mockResolvedValue(
        'lin_client_id',
      );
      jwtWrapperService.sign.mockReturnValue('signed-state-token');

      const { authorizationUrl } = await service.startAuthorizationFlow({
        applicationOAuthProvider: baseProvider,
        workspaceId: 'workspace-1',
        userId: 'user-1',
        userWorkspaceId: 'uws-1',
        scope: 'user',
        reconnectingConnectedAccountId: null,
        redirectLocation: null,
      });

      const url = new URL(authorizationUrl);

      expect(url.origin + url.pathname).toBe(
        'https://linear.app/oauth/authorize',
      );
      expect(url.searchParams.get('client_id')).toBe('lin_client_id');
      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('scope')).toBe('read write');
      expect(url.searchParams.get('state')).toBe('signed-state-token');
      expect(url.searchParams.get('redirect_uri')).toBe(
        'https://api.example.com/apps/oauth/callback',
      );
      expect(url.searchParams.has('code_challenge')).toBe(false);

      // signed payload carries workspace identity for the callback to use
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          type: JwtTokenTypeEnum.APP_OAUTH_STATE,
          workspaceId: 'workspace-1',
          applicationOAuthProviderId: 'provider-1',
          scope: 'user',
          reconnectingConnectedAccountId: null,
        }),
        expect.objectContaining({ secret: 'derived-secret' }),
      );
    });

    it('emits PKCE challenge params when usePkce is enabled', async () => {
      applicationVariableService.getRawValueByKeyOrThrow.mockResolvedValue(
        'lin_client_id',
      );
      jwtWrapperService.sign.mockReturnValue('signed-state');

      const { authorizationUrl } = await service.startAuthorizationFlow({
        applicationOAuthProvider: { ...baseProvider, usePkce: true },
        workspaceId: 'workspace-1',
        userId: 'user-1',
        userWorkspaceId: 'uws-1',
        scope: 'user',
        reconnectingConnectedAccountId: null,
        redirectLocation: null,
      });

      const url = new URL(authorizationUrl);

      expect(url.searchParams.get('code_challenge_method')).toBe('S256');
      expect(url.searchParams.get('code_challenge')).toMatch(/^[\w-]+$/);
    });
  });

  describe('completeAuthorizationFlow', () => {
    const stateClaims = {
      sub: 'provider-1',
      type: JwtTokenTypeEnum.APP_OAUTH_STATE,
      applicationOAuthProviderId: 'provider-1',
      workspaceId: 'workspace-1',
      userId: 'user-1',
      userWorkspaceId: 'uws-1',
      scope: 'user' as const,
      reconnectingConnectedAccountId: null,
      redirectLocation: null,
      codeVerifier: null,
    };

    const successfulTokenResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        access_token: 'new_access',
        refresh_token: 'new_refresh',
        scope: 'read write',
      }),
      text: async () => '',
    };

    beforeEach(() => {
      jwtWrapperService.verifyJwtToken.mockReturnValue(stateClaims);
      oauthProviderService.findOneByIdOrThrow.mockResolvedValue(baseProvider);
      applicationVariableService.getRawValueByKeyOrThrow
        .mockResolvedValueOnce('cid')
        .mockResolvedValueOnce('csec');
      secureHttpClientService.createSsrfSafeFetch.mockReturnValue(
        jest.fn(async () => successfulTokenResponse),
      );
    });

    it('always creates a new ConnectedAccount when no reconnect id is supplied', async () => {
      const result = await service.completeAuthorizationFlow({
        code: 'auth_code',
        state: 'signed-state',
      });

      expect(result.connectedAccountId).toBe('new-account-id');
      expect(result.workspaceId).toBe('workspace-1');

      expect(connectedAccountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: ConnectedAccountProvider.APP,
          accessToken: 'new_access',
          refreshToken: 'new_refresh',
          applicationOAuthProviderId: 'provider-1',
          applicationId: 'app-1',
          workspaceId: 'workspace-1',
          userWorkspaceId: 'uws-1',
          scope: 'user',
        }),
      );
      expect(connectedAccountRepository.save).toHaveBeenCalled();
      expect(connectedAccountRepository.update).not.toHaveBeenCalled();
    });

    it('updates the existing ConnectedAccount when reconnectingConnectedAccountId is supplied', async () => {
      jwtWrapperService.verifyJwtToken.mockReturnValue({
        ...stateClaims,
        reconnectingConnectedAccountId: 'existing-account-id',
      });

      const result = await service.completeAuthorizationFlow({
        code: 'auth_code',
        state: 'signed-state',
      });

      expect(result.connectedAccountId).toBe('existing-account-id');
      expect(connectedAccountRepository.update).toHaveBeenCalledWith(
        { id: 'existing-account-id', workspaceId: 'workspace-1' },
        expect.objectContaining({
          accessToken: 'new_access',
          refreshToken: 'new_refresh',
          authFailedAt: null,
        }),
      );
      expect(connectedAccountRepository.create).not.toHaveBeenCalled();
    });

    it('persists the workspace scope when state asks for it', async () => {
      jwtWrapperService.verifyJwtToken.mockReturnValue({
        ...stateClaims,
        scope: 'workspace',
      });

      await service.completeAuthorizationFlow({
        code: 'auth_code',
        state: 'signed-state',
      });

      expect(connectedAccountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ scope: 'workspace' }),
      );
    });

    it('rejects an invalid state', async () => {
      jwtWrapperService.verifyJwtToken.mockImplementation(() => {
        throw new Error('JWT expired');
      });

      await expect(
        service.completeAuthorizationFlow({
          code: 'auth_code',
          state: 'bad-state',
        }),
      ).rejects.toThrow(/state/);
    });
  });
});
