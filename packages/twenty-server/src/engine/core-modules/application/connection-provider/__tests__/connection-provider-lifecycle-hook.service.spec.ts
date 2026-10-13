import { IDENTIFY_ACCOUNT_TIMEOUT_MS } from 'src/engine/core-modules/application/connection-provider/constants/identify-account-timeout-ms.constant';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import type { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import type { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import type { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import type { LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import type { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import type { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import type { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const LOGIC_FUNCTION_ID = 'identify-logic-function-id';
const LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  'a1a1a1a1-a1a1-4a1a-a1a1-a1a1a1a1a1a1';

type IdentifyAccountProvider = Pick<
  ConnectionProviderEntity,
  'id' | 'name' | 'identifyAccountLogicFunctionUniversalIdentifier'
>;

const PROVIDER: IdentifyAccountProvider = {
  id: 'connection-provider-id',
  name: 'slack',
  identifyAccountLogicFunctionUniversalIdentifier:
    LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
};

const buildExecuteResult = (
  overrides: Partial<LogicFunctionExecuteResult> = {},
): LogicFunctionExecuteResult => ({
  data: null,
  duration: 12,
  billedDurationMs: 12,
  logs: '',
  status: LogicFunctionExecutionStatus.SUCCESS,
  ...overrides,
});

describe('ConnectionProviderLifecycleHookService', () => {
  const logicFunctionExecutorService = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<LogicFunctionExecutorService>;

  const workspaceCacheService = {
    getOrRecompute: jest.fn(),
  } as unknown as jest.Mocked<WorkspaceCacheService>;

  const exceptionHandlerService = {
    captureExceptions: jest.fn(),
  } as unknown as jest.Mocked<ExceptionHandlerService>;

  const service = new ConnectionProviderLifecycleHookService(
    {} as ConnectionProviderService,
    { add: jest.fn() } as unknown as MessageQueueService,
    logicFunctionExecutorService,
    workspaceCacheService,
    exceptionHandlerService,
  );

  const runIdentifyAccount = (provider: IdentifyAccountProvider = PROVIDER) =>
    service.runIdentifyAccount({
      provider,
      workspaceId: WORKSPACE_ID,
      accessToken: 'provisional-access-token',
    });

  const expectIdentifyFailure = async (
    promise: Promise<unknown>,
    expectedCode = ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_FAILED,
  ) => {
    const error = await promise.catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ConnectionProviderException);
    expect((error as ConnectionProviderException).code).toBe(expectedCode);
    expect((error as Error).message).not.toContain('provisional-access-token');
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatLogicFunctionMaps: {
        byUniversalIdentifier: {
          [LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER]: {
            id: LOGIC_FUNCTION_ID,
            deletedAt: null,
          },
        },
      },
    } as never);
  });

  describe('runIdentifyAccount', () => {
    it('returns null without executing anything when the provider declares no identify function', async () => {
      await expect(
        runIdentifyAccount({
          ...PROVIDER,
          identifyAccountLogicFunctionUniversalIdentifier: null,
        }),
      ).resolves.toBeNull();

      expect(logicFunctionExecutorService.execute).not.toHaveBeenCalled();
    });

    it('executes the identify function inline with the provisional token and returns its result', async () => {
      logicFunctionExecutorService.execute.mockResolvedValue(
        buildExecuteResult({
          data: { externalAccountId: '  T123  ', handle: 'Acme' },
        }),
      );

      await expect(runIdentifyAccount()).resolves.toEqual({
        externalAccountId: 'T123',
        handle: 'Acme',
      });

      expect(logicFunctionExecutorService.execute).toHaveBeenCalledWith({
        logicFunctionId: LOGIC_FUNCTION_ID,
        workspaceId: WORKSPACE_ID,
        payload: {
          connectionProviderId: PROVIDER.id,
          connectionProviderName: PROVIDER.name,
          accessToken: 'provisional-access-token',
        },
        shouldEnforceUsageLimits: true,
      });
    });

    it('returns a result without handle when none is returned', async () => {
      logicFunctionExecutorService.execute.mockResolvedValue(
        buildExecuteResult({ data: { externalAccountId: 'T123' } }),
      );

      await expect(runIdentifyAccount()).resolves.toEqual({
        externalAccountId: 'T123',
      });
    });

    it('returns null when the identify function returns null', async () => {
      logicFunctionExecutorService.execute.mockResolvedValue(
        buildExecuteResult({ data: null }),
      );

      await expect(runIdentifyAccount()).resolves.toBeNull();
    });

    it('throws when the identify function errors, without capturing it as a best-effort hook', async () => {
      logicFunctionExecutorService.execute.mockResolvedValue(
        buildExecuteResult({
          status: LogicFunctionExecutionStatus.ERROR,
          error: {
            errorType: 'Error',
            errorMessage: 'invalid_auth',
            stackTrace: [],
          },
        }),
      );

      await expectIdentifyFailure(runIdentifyAccount());

      expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
    });

    it('throws when the executor itself rejects', async () => {
      logicFunctionExecutorService.execute.mockRejectedValue(
        new Error('Logic function execution rate limit exceeded'),
      );

      await expectIdentifyFailure(runIdentifyAccount());
    });

    it.each([
      ['a non-object result', 'T123'],
      ['a missing externalAccountId', { handle: 'Acme' }],
      ['a non-string externalAccountId', { externalAccountId: 123 }],
      ['a blank externalAccountId', { externalAccountId: '   ' }],
      [
        'an externalAccountId over 512 characters',
        { externalAccountId: 'x'.repeat(513) },
      ],
      ['an empty handle', { externalAccountId: 'T123', handle: '' }],
      ['a non-string handle', { externalAccountId: 'T123', handle: 42 }],
    ])('throws on %s', async (_description, data) => {
      logicFunctionExecutorService.execute.mockResolvedValue(
        buildExecuteResult({ data: data as object }),
      );

      await expectIdentifyFailure(runIdentifyAccount());
    });

    it('accepts an externalAccountId of exactly 512 characters', async () => {
      logicFunctionExecutorService.execute.mockResolvedValue(
        buildExecuteResult({ data: { externalAccountId: 'x'.repeat(512) } }),
      );

      await expect(runIdentifyAccount()).resolves.toEqual({
        externalAccountId: 'x'.repeat(512),
      });
    });

    it('treats an execution exceeding the core-side cap as a failure', async () => {
      jest.useFakeTimers();
      logicFunctionExecutorService.execute.mockReturnValue(
        new Promise<LogicFunctionExecuteResult>(() => {}),
      );

      const pendingIdentify = runIdentifyAccount();
      const assertion = expectIdentifyFailure(pendingIdentify);

      await jest.advanceTimersByTimeAsync(IDENTIFY_ACCOUNT_TIMEOUT_MS);

      await assertion;
    });

    it('throws when the declared identify function does not exist in the workspace', async () => {
      workspaceCacheService.getOrRecompute.mockResolvedValue({
        flatLogicFunctionMaps: { byUniversalIdentifier: {} },
      } as never);

      await expectIdentifyFailure(
        runIdentifyAccount(),
        ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_NOT_FOUND,
      );

      expect(logicFunctionExecutorService.execute).not.toHaveBeenCalled();
    });
  });
});
