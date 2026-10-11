import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderIdentityService } from 'src/engine/core-modules/application/connection-provider/connection-provider-identity.service';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('ConnectionProviderIdentityService', () => {
  const execute = jest.fn();
  const getOrRecompute = jest.fn();
  const provider = {
    id: 'provider',
    name: 'linear',
    workspaceId: 'workspace',
    applicationId: 'application',
    identifyAccountLogicFunctionUniversalIdentifier: 'identity-function',
  } as ConnectionProviderEntity;
  const service = new ConnectionProviderIdentityService(
    { execute } as unknown as LogicFunctionExecutorService,
    { getOrRecompute } as unknown as WorkspaceCacheService,
  );
  const identify = (overrides: Partial<ConnectionProviderEntity> = {}) =>
    service.identifyAccount({
      provider: { ...provider, ...overrides },
      workspaceId: 'workspace',
      accessToken: 'secret' as PlaintextString,
      scopes: ['read'],
    });

  beforeEach(() => {
    jest.clearAllMocks();
    getOrRecompute.mockResolvedValue({
      flatLogicFunctionMaps: {
        byUniversalIdentifier: {
          'identity-function': {
            id: 'function',
            applicationId: 'application',
            deletedAt: null,
          },
        },
      },
    });
    execute.mockResolvedValue({
      data: { externalAccountId: 'org:user', handle: 'alice@example.com' },
    });
  });

  it('only identifies providers that explicitly declare an identity hook', async () => {
    expect(
      await identify({ identifyAccountLogicFunctionUniversalIdentifier: null }),
    ).toBeNull();
    expect(execute).not.toHaveBeenCalled();
  });

  it('executes in the same app with a bounded timeout and validates the account', async () => {
    expect(await identify()).toEqual({
      externalAccountId: 'org:user',
      handle: 'alice@example.com',
    });
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionId: 'function',
        workspaceId: 'workspace',
        timeoutMs: 10_000,
        payload: {
          connectionProviderId: 'provider',
          connectionProviderName: 'linear',
          accessToken: 'secret',
          scopes: ['read'],
        },
      }),
    );
  });

  it.each([
    { id: 'function', applicationId: 'another-application', deletedAt: null },
    { id: 'function', applicationId: 'application', deletedAt: new Date() },
    undefined,
  ])(
    'never passes credentials to a missing, deleted, or foreign app function',
    async (logicFunction) => {
      getOrRecompute.mockResolvedValue({
        flatLogicFunctionMaps: {
          byUniversalIdentifier: { 'identity-function': logicFunction },
        },
      });

      await expect(identify()).rejects.toMatchObject({
        code: ConnectionProviderExceptionCode.ACCOUNT_IDENTIFICATION_FAILED,
      });
      expect(execute).not.toHaveBeenCalled();
    },
  );

  it('never passes credentials across workspaces', async () => {
    await expect(
      identify({ workspaceId: 'another-workspace' }),
    ).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.ACCOUNT_IDENTIFICATION_FAILED,
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([
    null,
    [],
    {},
    { externalAccountId: '' },
    { externalAccountId: ' ' },
    { externalAccountId: 'a'.repeat(513) },
    { externalAccountId: 'user\u0000id' },
    { externalAccountId: 42 },
    { externalAccountId: 'user', handle: '' },
    { externalAccountId: 'user', handle: 'a'.repeat(321) },
    { externalAccountId: 'user', handle: 'user\u0000@example.com' },
  ])('rejects malformed or unbounded identity %j', async (data) => {
    execute.mockResolvedValue({ data });
    await expect(identify()).rejects.toMatchObject({
      code: ConnectionProviderExceptionCode.ACCOUNT_IDENTIFICATION_FAILED,
    });
  });

  it('does not expose a failed hook error containing its input credential', async () => {
    execute.mockRejectedValue(new Error('request failed: secret'));
    await expect(identify()).rejects.toMatchObject({
      message: 'Account identification failed for connection provider provider',
    });
  });
});
