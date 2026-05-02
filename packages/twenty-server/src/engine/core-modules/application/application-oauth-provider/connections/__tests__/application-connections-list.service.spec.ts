// SecureHttpClientService transitively depends on `@lifeomic/axios-fetch`,
// which is an optional native-binding dep that's flaky in some test envs.
// The list service uses ConnectedAccountRefreshTokensService (which pulls in
// the SSRF-safe HTTP client), so stub the module to avoid loading the dep.
// We never use the real implementation here — the test always injects a mock.
jest.mock(
  'src/engine/core-modules/secure-http-client/secure-http-client.service',
  () => ({
    SecureHttpClientService: class {},
  }),
);

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { ApplicationConnectionsListService } from 'src/engine/core-modules/application/application-oauth-provider/connections/services/application-connections-list.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

const APP_ID = 'app-1';
const WORKSPACE_ID = 'workspace-1';
const REQUEST_USER_WORKSPACE_ID = 'uws-request';
const OTHER_USER_WORKSPACE_ID = 'uws-other';

const buildAccount = (
  overrides: Partial<ConnectedAccountEntity> = {},
): ConnectedAccountEntity =>
  ({
    id: 'conn-1',
    name: 'octocat@example.com',
    handle: 'octocat@example.com',
    scope: 'user',
    applicationId: APP_ID,
    applicationOAuthProviderId: 'provider-1',
    workspaceId: WORKSPACE_ID,
    userWorkspaceId: REQUEST_USER_WORKSPACE_ID,
    provider: ConnectedAccountProvider.APP,
    accessToken: 'enc',
    refreshToken: 'enc',
    scopes: ['read'],
    lastCredentialsRefreshedAt: new Date('2024-01-01T00:00:00Z'),
    authFailedAt: null,
    ...overrides,
  }) as unknown as ConnectedAccountEntity;

describe('ApplicationConnectionsListService', () => {
  let service: ApplicationConnectionsListService;
  let connectedAccountRepository: { find: jest.Mock };
  let oauthProviderRepository: { findOne: jest.Mock };
  let refreshTokensService: { refreshAndSaveTokens: jest.Mock };

  beforeEach(async () => {
    connectedAccountRepository = { find: jest.fn() };
    oauthProviderRepository = { findOne: jest.fn() };
    refreshTokensService = {
      refreshAndSaveTokens: jest.fn(async () => ({
        accessToken: 'fresh-access',
        refreshToken: 'fresh-refresh',
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationConnectionsListService,
        {
          provide: ConnectedAccountRefreshTokensService,
          useValue: refreshTokensService,
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: connectedAccountRepository,
        },
        {
          provide: getRepositoryToken(ApplicationOAuthProviderEntity),
          useValue: oauthProviderRepository,
        },
      ],
    }).compile();

    service = module.get(ApplicationConnectionsListService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('list', () => {
    it('hides user-scoped credentials owned by another user when called with a request user', async () => {
      connectedAccountRepository.find.mockResolvedValue([
        buildAccount({ id: 'mine' }),
        buildAccount({
          id: 'theirs',
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
        }),
        buildAccount({
          id: 'shared',
          scope: 'workspace',
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
        }),
      ]);

      const result = await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        filter: {},
      });

      expect(result.map((c) => c.id).sort()).toEqual(['mine', 'shared']);
    });

    it('returns all credentials when no request user is provided (cron)', async () => {
      connectedAccountRepository.find.mockResolvedValue([
        buildAccount({ id: 'mine' }),
        buildAccount({
          id: 'theirs',
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
        }),
        buildAccount({
          id: 'shared',
          scope: 'workspace',
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
        }),
      ]);

      const result = await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: null,
        filter: {},
      });

      expect(result.map((c) => c.id).sort()).toEqual([
        'mine',
        'shared',
        'theirs',
      ]);
    });

    it('returns empty list when filter.providerName matches no provider for this app', async () => {
      oauthProviderRepository.findOne.mockResolvedValue(null);

      const result = await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        filter: { providerName: 'unknown-provider' },
      });

      expect(result).toEqual([]);
      expect(connectedAccountRepository.find).not.toHaveBeenCalled();
    });

    it('refreshes the access token before returning', async () => {
      connectedAccountRepository.find.mockResolvedValue([buildAccount()]);

      const result = await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        filter: {},
      });

      expect(refreshTokensService.refreshAndSaveTokens).toHaveBeenCalledTimes(
        1,
      );
      expect(result[0].accessToken).toBe('fresh-access');
    });

    it('skips a connection when the refresh fails', async () => {
      connectedAccountRepository.find.mockResolvedValue([
        buildAccount({ id: 'good' }),
        buildAccount({ id: 'broken' }),
      ]);
      refreshTokensService.refreshAndSaveTokens
        .mockResolvedValueOnce({ accessToken: 'fresh', refreshToken: 'r' })
        .mockRejectedValueOnce(new Error('refresh failed'));

      const result = await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        filter: {},
      });

      expect(result.map((c) => c.id)).toEqual(['good']);
    });
  });
});
