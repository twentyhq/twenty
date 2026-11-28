import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationHealthStatus } from 'twenty-shared/application';

import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { ConnectionCheckService } from 'src/engine/core-modules/application/connection-provider/connection-check.service';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const WORKSPACE_ID = 'workspace-id';
const USER_ID = 'user-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const CONNECTED_ACCOUNT_ID = 'connected-account-id';

const CONNECTED_ACCOUNT = {
  id: CONNECTED_ACCOUNT_ID,
  connectionProviderId: 'connection-provider-id',
  scope: 'USER',
  authFailedAt: null,
};

const PROVIDER = {
  id: 'connection-provider-id',
  name: 'github-user',
  applicationId: 'application-id',
  checkConnectionLogicFunctionUniversalIdentifier: 'check-function-id',
  oauthConfig: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    revokeEndpoint: null,
  },
  oauthDiscoveryConfig: null,
};

describe('ConnectionCheckService', () => {
  let service: ConnectionCheckService;
  const findOne = jest.fn();
  const findOneByIdOrThrow = jest.fn();
  const validateCallerCanManageConnection = jest.fn();
  const runCheckConnection = jest.fn();
  const tokenBucketThrottleOrThrow = jest.fn();

  const run = () =>
    service.run({
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
    });

  beforeEach(async () => {
    jest.resetAllMocks();
    findOne.mockResolvedValue(CONNECTED_ACCOUNT);
    findOneByIdOrThrow.mockResolvedValue(PROVIDER);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionCheckService,
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: { findOne },
        },
        {
          provide: ConnectionProviderService,
          useValue: { findOneByIdOrThrow },
        },
        {
          provide: AppConnectionAccessService,
          useValue: { validateCallerCanManageConnection },
        },
        {
          provide: ConnectionProviderLifecycleHookService,
          useValue: { runCheckConnection },
        },
        { provide: ThrottlerService, useValue: { tokenBucketThrottleOrThrow } },
      ],
    }).compile();

    service = module.get(ConnectionCheckService);
  });

  it('runs the check as the requesting member and returns its result', async () => {
    runCheckConnection.mockResolvedValue({
      status: 'WARNING',
      title: 'GitHub is not installed on any of your accounts',
      action: {
        label: 'Install on GitHub',
        location: 'https://github.com/apps/twenty/installations/new',
      },
    });

    await expect(run()).resolves.toEqual({
      status: ApplicationHealthStatus.WARNING,
      title: 'GitHub is not installed on any of your accounts',
      description: null,
      action: {
        label: 'Install on GitHub',
        location: 'https://github.com/apps/twenty/installations/new',
      },
    });
    expect(runCheckConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        userId: USER_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
      }),
    );
    expect(validateCallerCanManageConnection).toHaveBeenCalledWith({
      isWorkspaceShared: false,
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
    });
  });

  it('refuses a connection the member cannot see', async () => {
    findOne.mockResolvedValue(null);

    await expect(run()).rejects.toThrow(
      `Connection ${CONNECTED_ACCOUNT_ID} not found`,
    );
    expect(runCheckConnection).not.toHaveBeenCalled();
  });

  it('skips a connection that already needs reconnecting', async () => {
    findOne.mockResolvedValue({
      ...CONNECTED_ACCOUNT,
      authFailedAt: new Date(),
    });

    await expect(run()).resolves.toBeNull();
    expect(runCheckConnection).not.toHaveBeenCalled();
  });

  it('returns null when the provider declares no check', async () => {
    findOneByIdOrThrow.mockResolvedValue({
      ...PROVIDER,
      checkConnectionLogicFunctionUniversalIdentifier: null,
    });

    await expect(run()).resolves.toBeNull();
    expect(tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
  });

  it('reads a failed or malformed check as unknown', async () => {
    runCheckConnection.mockResolvedValue(undefined);

    await expect(run()).resolves.toEqual({
      status: ApplicationHealthStatus.UNKNOWN,
      title: null,
      description: null,
      action: null,
    });
  });

  it('drops an action that leaves for a host the provider does not own', async () => {
    runCheckConnection.mockResolvedValue({
      status: 'ERROR',
      title: 'Access revoked',
      action: { label: 'Fix', location: 'https://evil.example/fix' },
    });

    await expect(run()).resolves.toMatchObject({ action: null });
  });
});
