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

import { NotFoundException } from '@nestjs/common';
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
const PROVIDER_ID = 'provider-1';

const buildProvider = (
  overrides: Partial<ApplicationOAuthProviderEntity> = {},
): ApplicationOAuthProviderEntity =>
  ({
    id: PROVIDER_ID,
    applicationId: APP_ID,
    workspaceId: WORKSPACE_ID,
    name: 'linear',
    displayName: 'Linear',
    scopes: ['read', 'write'],
    ...overrides,
  }) as unknown as ApplicationOAuthProviderEntity;

const buildAccount = (
  overrides: Partial<ConnectedAccountEntity> = {},
): ConnectedAccountEntity =>
  ({
    id: 'conn-1',
    name: 'Linear #1',
    handle: 'octocat@example.com',
    visibility: 'user',
    applicationId: APP_ID,
    applicationConnectionProviderId: PROVIDER_ID,
    workspaceId: WORKSPACE_ID,
    userWorkspaceId: REQUEST_USER_WORKSPACE_ID,
    provider: ConnectedAccountProvider.APP,
    accessToken: 'enc',
    refreshToken: 'enc',
    // OAuth scopes granted by the upstream provider — distinct from the
    // row-level `visibility` field above.
    scopes: ['read', 'write'],
    lastCredentialsRefreshedAt: new Date('2024-01-01T00:00:00Z'),
    authFailedAt: null,
    ...overrides,
  }) as unknown as ConnectedAccountEntity;

describe('ApplicationConnectionsListService', () => {
  let service: ApplicationConnectionsListService;
  let connectedAccountRepository: { find: jest.Mock; findOne: jest.Mock };
  let oauthProviderRepository: {
    find: jest.Mock;
    findOneByOrFail: jest.Mock;
  };
  let refreshTokensService: { refreshAndSaveTokens: jest.Mock };

  beforeEach(async () => {
    connectedAccountRepository = { find: jest.fn(), findOne: jest.fn() };
    oauthProviderRepository = {
      find: jest.fn().mockResolvedValue([buildProvider()]),
      findOneByOrFail: jest.fn().mockResolvedValue(buildProvider()),
    };
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
    it('asks SQL to OR (visibility = workspace) with (visibility = user AND userWorkspaceId = me) when there is a request user', async () => {
      connectedAccountRepository.find.mockResolvedValue([
        buildAccount({ id: 'mine' }),
        buildAccount({
          id: 'shared',
          visibility: 'workspace',
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
      expect(connectedAccountRepository.find).toHaveBeenCalledWith({
        where: [
          expect.objectContaining({ visibility: 'workspace' }),
          expect.objectContaining({
            visibility: 'user',
            userWorkspaceId: REQUEST_USER_WORKSPACE_ID,
          }),
        ],
      });
    });

    it('skips the privacy OR clause when no request user is provided (cron)', async () => {
      connectedAccountRepository.find.mockResolvedValue([
        buildAccount({ id: 'mine' }),
        buildAccount({
          id: 'theirs',
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
        }),
      ]);

      const result = await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: null,
        filter: {},
      });

      expect(result.map((c) => c.id).sort()).toEqual(['mine', 'theirs']);
      expect(connectedAccountRepository.find).toHaveBeenCalledWith({
        where: expect.not.objectContaining({ visibility: expect.anything() }),
      });
    });

    it('respects filter.visibility=user under request-user privacy (regression)', async () => {
      // Bug guard: an earlier version OR'd { visibility: 'workspace' } into
      // the privacy where regardless of the caller's filter, so requesting
      // user-visibility only would silently leak workspace-shared rows back.
      connectedAccountRepository.find.mockResolvedValue([buildAccount()]);

      await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        filter: { visibility: 'user' },
      });

      expect(connectedAccountRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          visibility: 'user',
          userWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        }),
      });
      // Specifically not the OR shape — single AND object.
      const passed = connectedAccountRepository.find.mock.calls[0][0];

      expect(Array.isArray(passed.where)).toBe(false);
    });

    it('respects filter.visibility=workspace under request-user privacy', async () => {
      connectedAccountRepository.find.mockResolvedValue([buildAccount()]);

      await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        filter: { visibility: 'workspace' },
      });

      const passed = connectedAccountRepository.find.mock.calls[0][0];

      expect(passed.where).toEqual(
        expect.objectContaining({ visibility: 'workspace' }),
      );
      expect(passed.where).not.toHaveProperty('userWorkspaceId');
      expect(Array.isArray(passed.where)).toBe(false);
    });

    it('passes filter.visibility through unchanged in cron context', async () => {
      connectedAccountRepository.find.mockResolvedValue([buildAccount()]);

      await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: null,
        filter: { visibility: 'user' },
      });

      expect(connectedAccountRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({ visibility: 'user' }),
      });
    });

    it('returns empty list when filter.providerName matches no provider for this app', async () => {
      oauthProviderRepository.find.mockResolvedValue([]);

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

    it('exposes provider name and other public fields in the DTO', async () => {
      connectedAccountRepository.find.mockResolvedValue([buildAccount()]);

      const [connection] = await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        filter: {},
      });

      expect(connection).toEqual({
        id: 'conn-1',
        providerName: 'linear',
        name: 'Linear #1',
        handle: 'octocat@example.com',
        visibility: 'user',
        userWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        accessToken: 'fresh-access',
        scopes: ['read', 'write'],
        authFailedAt: null,
      });
    });

    it('falls back to handle when name is null', async () => {
      connectedAccountRepository.find.mockResolvedValue([
        buildAccount({ name: null }),
      ]);

      const [connection] = await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        filter: {},
      });

      expect(connection.name).toBe('octocat@example.com');
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

    it('skips a connection whose provider was deleted (orphan)', async () => {
      connectedAccountRepository.find.mockResolvedValue([
        buildAccount({
          id: 'orphan',
          applicationConnectionProviderId: 'gone-provider',
        }),
      ]);

      const result = await service.list({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        filter: {},
      });

      expect(result).toEqual([]);
    });
  });

  describe('getOne', () => {
    it('returns the connection when the request user owns it', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(buildAccount());

      const result = await service.getOne({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        id: 'conn-1',
      });

      expect(result.id).toBe('conn-1');
      expect(result.providerName).toBe('linear');
      expect(result.accessToken).toBe('fresh-access');
    });

    it('returns the connection when visibility is workspace, regardless of owner', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(
        buildAccount({
          visibility: 'workspace',
          userWorkspaceId: OTHER_USER_WORKSPACE_ID,
        }),
      );

      const result = await service.getOne({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
        id: 'conn-1',
      });

      expect(result.id).toBe('conn-1');
    });

    it('throws NotFound when the connection does not exist', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getOne({
          applicationId: APP_ID,
          workspaceId: WORKSPACE_ID,
          requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
          id: 'missing',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFound when a request user asks for another user-visibility connection', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(
        buildAccount({ userWorkspaceId: OTHER_USER_WORKSPACE_ID }),
      );

      await expect(
        service.getOne({
          applicationId: APP_ID,
          workspaceId: WORKSPACE_ID,
          requestUserWorkspaceId: REQUEST_USER_WORKSPACE_ID,
          id: 'conn-1',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns another user-visibility connection in cron context (no request user)', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(
        buildAccount({ userWorkspaceId: OTHER_USER_WORKSPACE_ID }),
      );

      const result = await service.getOne({
        applicationId: APP_ID,
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: null,
        id: 'conn-1',
      });

      expect(result.userWorkspaceId).toBe(OTHER_USER_WORKSPACE_ID);
    });
  });
});
