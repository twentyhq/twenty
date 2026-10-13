import { type Repository } from 'typeorm';

import type { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import type { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import type { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { exchangeCodeForToken } from 'src/engine/core-modules/application/connection-provider/utils/exchange-code-for-token.util';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import type { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import type { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import type { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import type { UserEntity } from 'src/engine/core-modules/user/user.entity';
import type { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import type { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

jest.mock(
  'src/engine/core-modules/application/connection-provider/utils/exchange-code-for-token.util',
);

const WORKSPACE_ID = 'workspace-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const RECONNECTING_CONNECTED_ACCOUNT_ID = 'connected-account-id';

const PROVIDER = {
  id: 'connection-provider-id',
  applicationId: 'application-id',
  name: 'slack',
  displayName: 'Slack',
  type: 'oauth',
  identifyAccountLogicFunctionUniversalIdentifier:
    'a1a1a1a1-a1a1-4a1a-a1a1-a1a1a1a1a1a1',
  oauthConfig: {
    authorizationEndpoint: 'https://slack.com/oauth/v2/authorize',
    tokenEndpoint: 'https://slack.com/api/oauth.v2.access',
    revokeEndpoint: null,
    scopes: ['chat:write'],
    clientIdVariable: 'SLACK_CLIENT_ID',
    clientSecretVariable: 'SLACK_CLIENT_SECRET',
    authorizationParams: null,
    tokenRequestContentType: 'form-urlencoded',
    usePkce: true,
  },
};

const buildStatePayload = (reconnectingConnectedAccountId: string | null) => ({
  sub: PROVIDER.id,
  type: JwtTokenTypeEnum.APP_OAUTH_STATE,
  connectionProviderId: PROVIDER.id,
  workspaceId: WORKSPACE_ID,
  userId: 'user-id',
  userWorkspaceId: USER_WORKSPACE_ID,
  visibility: 'workspace' as const,
  reconnectingConnectedAccountId,
  redirectLocation: null,
  codeVerifier: 'code-verifier',
});

const buildExistingConnectedAccount = (
  overrides: Partial<ConnectedAccountEntity> = {},
) =>
  ({
    id: RECONNECTING_CONNECTED_ACCOUNT_ID,
    workspaceId: WORKSPACE_ID,
    handle: 'Team A',
    externalAccountId: 'TEAM_A',
    ...overrides,
  }) as ConnectedAccountEntity;

describe('ConnectionProviderOAuthFlowService', () => {
  const connectionProviderService = {
    findOneByIdOrThrow: jest.fn(),
    getClientCredentials: jest.fn(),
  } as unknown as jest.Mocked<ConnectionProviderService>;

  const jwtWrapperService = {
    verifyJwtToken: jest.fn(),
  } as unknown as jest.Mocked<JwtWrapperService>;

  const connectionProviderLifecycleHookService = {
    runIdentifyAccount: jest.fn(),
    dispatchOnConnect: jest.fn(),
  } as unknown as jest.Mocked<ConnectionProviderLifecycleHookService>;

  const connectedAccountRepository = {
    findOne: jest.fn(),
    findOneByOrFail: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    create: jest.fn((entity: Partial<ConnectedAccountEntity>) => entity),
    save: jest.fn(),
  } as unknown as jest.Mocked<Repository<ConnectedAccountEntity>>;

  const userRepository = {
    findOneBy: jest.fn(),
  } as unknown as jest.Mocked<Repository<UserEntity>>;

  const service = new ConnectionProviderOAuthFlowService(
    connectionProviderService,
    jwtWrapperService,
    {
      createSsrfSafeFetch: jest.fn(),
    } as unknown as SecureHttpClientService,
    {
      get: jest.fn().mockReturnValue('https://api.twenty.test'),
    } as unknown as TwentyConfigService,
    {
      encryptTokenPair: jest.fn(({ accessToken, refreshToken }) => ({
        encryptedAccessToken: `enc:v2:${accessToken}`,
        encryptedRefreshToken: refreshToken ? `enc:v2:${refreshToken}` : null,
      })),
    } as unknown as ConnectedAccountTokenEncryptionService,
    connectionProviderLifecycleHookService,
    {} as AppConnectionAccessService,
    connectedAccountRepository,
    userRepository,
  );

  const completeAuthorizationFlow = async (
    reconnectingConnectedAccountId: string | null,
  ) => {
    jwtWrapperService.verifyJwtToken.mockResolvedValue(
      buildStatePayload(reconnectingConnectedAccountId) as never,
    );

    return service.completeAuthorizationFlow({ code: 'code', state: 'state' });
  };

  const expectNothingPersisted = () => {
    expect(connectedAccountRepository.update).not.toHaveBeenCalled();
    expect(connectedAccountRepository.save).not.toHaveBeenCalled();
    expect(
      connectionProviderLifecycleHookService.dispatchOnConnect,
    ).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    jest.clearAllMocks();

    connectionProviderService.findOneByIdOrThrow.mockResolvedValue(
      PROVIDER as never,
    );
    connectionProviderService.getClientCredentials.mockResolvedValue({
      clientId: 'client-id',
      clientSecret: 'client-secret',
    } as never);
    jest.mocked(exchangeCodeForToken).mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      idToken: null,
      scopes: ['chat:write'],
    } as never);
    userRepository.findOneBy.mockResolvedValue({
      email: 'installer@example.com',
    } as UserEntity);
    connectedAccountRepository.count.mockResolvedValue(0);
    connectedAccountRepository.save.mockImplementation(
      async (entity) =>
        ({ id: 'created-connected-account-id', ...entity }) as never,
    );
    connectedAccountRepository.findOneByOrFail.mockResolvedValue(
      buildExistingConnectedAccount(),
    );
  });

  it('identifies the account with the provisional access token before persisting it', async () => {
    connectionProviderLifecycleHookService.runIdentifyAccount.mockResolvedValue(
      { externalAccountId: 'TEAM_A', handle: 'Team A' },
    );

    await completeAuthorizationFlow(null);

    expect(
      connectionProviderLifecycleHookService.runIdentifyAccount,
    ).toHaveBeenCalledWith({
      provider: PROVIDER,
      workspaceId: WORKSPACE_ID,
      accessToken: 'new-access-token',
    });

    const identifyCallOrder =
      connectionProviderLifecycleHookService.runIdentifyAccount.mock
        .invocationCallOrder[0];
    const saveCallOrder =
      connectedAccountRepository.save.mock.invocationCallOrder[0];

    expect(identifyCallOrder).toBeLessThan(saveCallOrder);
  });

  it('stores the external account id and the identified handle on first connect', async () => {
    connectionProviderLifecycleHookService.runIdentifyAccount.mockResolvedValue(
      { externalAccountId: 'TEAM_A', handle: 'Team A' },
    );

    const result = await completeAuthorizationFlow(null);

    expect(connectedAccountRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        externalAccountId: 'TEAM_A',
        handle: 'Team A',
        connectionProviderId: PROVIDER.id,
      }),
    );
    expect(userRepository.findOneBy).not.toHaveBeenCalled();
    expect(result.connectedAccountId).toBe('created-connected-account-id');
    expect(
      connectionProviderLifecycleHookService.dispatchOnConnect,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        connectedAccountId: 'created-connected-account-id',
      }),
    );
  });

  it('falls back to the resolved handle when the identify result has none', async () => {
    connectionProviderLifecycleHookService.runIdentifyAccount.mockResolvedValue(
      { externalAccountId: 'TEAM_A' },
    );

    await completeAuthorizationFlow(null);

    expect(connectedAccountRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        externalAccountId: 'TEAM_A',
        handle: 'installer@example.com',
      }),
    );
  });

  it('keeps the previous behaviour when the provider has no identify function', async () => {
    connectionProviderLifecycleHookService.runIdentifyAccount.mockResolvedValue(
      null,
    );

    await completeAuthorizationFlow(null);

    const createdEntity = connectedAccountRepository.create.mock.calls[0][0];

    expect(createdEntity).not.toHaveProperty('externalAccountId');
    expect(createdEntity).toEqual(
      expect.objectContaining({ handle: 'installer@example.com' }),
    );
  });

  it('updates the tokens of the same row when the reconnect resolves to the same account', async () => {
    connectionProviderLifecycleHookService.runIdentifyAccount.mockResolvedValue(
      { externalAccountId: 'TEAM_A', handle: 'Team A renamed' },
    );
    connectedAccountRepository.findOne.mockResolvedValue(
      buildExistingConnectedAccount(),
    );

    const result = await completeAuthorizationFlow(
      RECONNECTING_CONNECTED_ACCOUNT_ID,
    );

    expect(connectedAccountRepository.update).toHaveBeenCalledWith(
      { id: RECONNECTING_CONNECTED_ACCOUNT_ID, workspaceId: WORKSPACE_ID },
      expect.objectContaining({
        accessToken: 'enc:v2:new-access-token',
        externalAccountId: 'TEAM_A',
        handle: 'Team A renamed',
      }),
    );
    expect(connectedAccountRepository.save).not.toHaveBeenCalled();
    expect(result.connectedAccountId).toBe(RECONNECTING_CONNECTED_ACCOUNT_ID);
  });

  it('refuses a reconnect that resolves to a different account without touching the row', async () => {
    connectionProviderLifecycleHookService.runIdentifyAccount.mockResolvedValue(
      { externalAccountId: 'TEAM_B', handle: 'Team B' },
    );
    connectedAccountRepository.findOne.mockResolvedValue(
      buildExistingConnectedAccount(),
    );

    const error = await completeAuthorizationFlow(
      RECONNECTING_CONNECTED_ACCOUNT_ID,
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ConnectionProviderException);
    expect((error as ConnectionProviderException).code).toBe(
      ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_MISMATCH,
    );
    expect((error as Error).message).toContain('Team A');
    expect((error as Error).message).toContain('Team B');
    expectNothingPersisted();
  });

  it('pins the external account id on a reconnect target created before identification existed', async () => {
    connectionProviderLifecycleHookService.runIdentifyAccount.mockResolvedValue(
      { externalAccountId: 'TEAM_B', handle: 'Team B' },
    );
    connectedAccountRepository.findOne.mockResolvedValue(
      buildExistingConnectedAccount({ externalAccountId: null }),
    );

    await completeAuthorizationFlow(RECONNECTING_CONNECTED_ACCOUNT_ID);

    expect(connectedAccountRepository.update).toHaveBeenCalledWith(
      { id: RECONNECTING_CONNECTED_ACCOUNT_ID, workspaceId: WORKSPACE_ID },
      expect.objectContaining({ externalAccountId: 'TEAM_B' }),
    );
  });

  it('skips the comparison and keeps the stored id when the identify function returns null', async () => {
    connectionProviderLifecycleHookService.runIdentifyAccount.mockResolvedValue(
      null,
    );

    await completeAuthorizationFlow(RECONNECTING_CONNECTED_ACCOUNT_ID);

    expect(connectedAccountRepository.findOne).not.toHaveBeenCalled();

    const updatedFields = connectedAccountRepository.update.mock.calls[0][1];

    expect(updatedFields).not.toHaveProperty('externalAccountId');
    expect(updatedFields).toEqual(
      expect.objectContaining({ accessToken: 'enc:v2:new-access-token' }),
    );
  });

  it('persists nothing when the identify step fails', async () => {
    connectionProviderLifecycleHookService.runIdentifyAccount.mockRejectedValue(
      new ConnectionProviderException(
        'identifyAccount logic function failed',
        ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_FAILED,
      ),
    );

    await expect(
      completeAuthorizationFlow(RECONNECTING_CONNECTED_ACCOUNT_ID),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_FAILED,
    });

    expectNothingPersisted();
  });
});
