import { type Request } from 'express';
import { type Repository } from 'typeorm';

import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  type LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { ServerRouteTriggerExceptionCode } from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { ServerRouteTriggerService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

const RESOLVER_UID = 'resolver-uid';
const TARGET_UID = 'target-uid';

const buildExecuteResult = (
  data: object | null,
  error?: { errorMessage: string },
): LogicFunctionExecuteResult => ({
  data,
  duration: 1,
  logs: '',
  status: error
    ? LogicFunctionExecutionStatus.ERROR
    : LogicFunctionExecutionStatus.SUCCESS,
  ...(error
    ? {
        error: {
          errorType: 'Error',
          errorMessage: error.errorMessage,
          stackTrace: '',
        },
      }
    : {}),
});

const buildRequest = (body: object | null = {}): Request =>
  ({
    method: 'POST',
    path: `/webhooks/server/${RESOLVER_UID}`,
    query: {},
    headers: {},
    rawBody: Buffer.from(JSON.stringify(body ?? {}), 'utf-8'),
    body,
  }) as unknown as Request;

describe('ServerRouteTriggerService', () => {
  let service: ServerRouteTriggerService;
  let logicFunctionRepository: jest.Mocked<
    Pick<Repository<LogicFunctionEntity>, 'find' | 'findOne'>
  >;
  let logicFunctionExecutorService: jest.Mocked<
    Pick<LogicFunctionExecutorService, 'execute'>
  >;
  let twentyConfigService: jest.Mocked<Pick<TwentyConfigService, 'get'>>;

  const handle = () =>
    service.handle({
      request: buildRequest(),
      resolverLogicFunctionUniversalIdentifier: RESOLVER_UID,
    });

  const buildResolverRow = (overrides: Record<string, unknown> = {}) => ({
    id: 'resolver-id',
    universalIdentifier: RESOLVER_UID,
    workspaceId: 'owner-ws',
    serverRouteTriggerSettings: { forwardedRequestHeaders: ['x-test'] },
    application: {
      applicationRegistration: { id: 'reg-1', ownerWorkspaceId: 'owner-ws' },
    },
    ...overrides,
  });

  beforeEach(() => {
    logicFunctionRepository = {
      find: jest.fn().mockResolvedValue([buildResolverRow()]),
      findOne: jest
        .fn()
        // resolver lookup inside runFunction
        .mockResolvedValueOnce({ id: 'resolver-id' })
        // target lookup inside runFunction
        .mockResolvedValueOnce({ id: 'target-id' }),
    };
    logicFunctionExecutorService = {
      execute: jest
        .fn()
        // resolver returns { workspaceId, targetLogicFunctionUniversalIdentifier, payload }
        .mockResolvedValueOnce(
          buildExecuteResult({
            workspaceId: 'target-ws',
            targetLogicFunctionUniversalIdentifier: TARGET_UID,
            payload: { from: 'resolver' },
          }),
        )
        // target returns the final response body
        .mockResolvedValueOnce(buildExecuteResult({ ok: true })),
    };
    twentyConfigService = { get: jest.fn().mockReturnValue(true) };

    service = new ServerRouteTriggerService(
      logicFunctionRepository as unknown as Repository<LogicFunctionEntity>,
      logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
      twentyConfigService as unknown as TwentyConfigService,
    );
  });

  it('runs the resolver in the owner workspace then the resolver-named target in the resolved workspace', async () => {
    const result = await handle();

    expect(logicFunctionExecutorService.execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        logicFunctionId: 'resolver-id',
        workspaceId: 'owner-ws',
      }),
    );
    expect(logicFunctionExecutorService.execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        logicFunctionId: 'target-id',
        workspaceId: 'target-ws',
        payload: { from: 'resolver' },
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        statusCode: 200,
        body: { ok: true },
      }),
    );
  });

  it('refuses when the feature is disabled', async () => {
    twentyConfigService.get.mockReturnValue(false);

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.FEATURE_DISABLED,
    });
  });

  it('throws LOGIC_FUNCTION_NOT_FOUND when no row matches the universalIdentifier', async () => {
    logicFunctionRepository.find.mockResolvedValue([]);

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('throws LOGIC_FUNCTION_NOT_FOUND when only non-owner-workspace copies exist', async () => {
    logicFunctionRepository.find.mockResolvedValue([
      buildResolverRow({
        workspaceId: 'other-ws',
        application: {
          applicationRegistration: { ownerWorkspaceId: 'owner-ws' },
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any);

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('picks the owner-workspace copy when multiple workspaces installed the app', async () => {
    logicFunctionRepository.find.mockResolvedValue([
      buildResolverRow({
        id: 'tenant-copy',
        workspaceId: 'tenant-ws',
        application: {
          applicationRegistration: {
            id: 'reg-1',
            ownerWorkspaceId: 'owner-ws',
          },
        },
      }),
      buildResolverRow({
        id: 'owner-copy',
        workspaceId: 'owner-ws',
        application: {
          applicationRegistration: {
            id: 'reg-1',
            ownerWorkspaceId: 'owner-ws',
          },
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any);

    await handle();

    // runFunction's internal findOne is called with the
    // (universalIdentifier, workspaceId) of the owner-workspace copy.
    expect(logicFunctionRepository.findOne).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          universalIdentifier: RESOLVER_UID,
          workspaceId: 'owner-ws',
        }),
      }),
    );
  });

  it('throws RESOLVER_INVALID_RESULT when the resolver does not return a workspaceId', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockResolvedValueOnce(
      buildExecuteResult({
        targetLogicFunctionUniversalIdentifier: TARGET_UID,
      }),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.RESOLVER_INVALID_RESULT,
    });
  });

  it('throws RESOLVER_INVALID_RESULT when the resolver does not return a targetLogicFunctionUniversalIdentifier', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockResolvedValueOnce(
      buildExecuteResult({ workspaceId: 'target-ws' }),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.RESOLVER_INVALID_RESULT,
    });
  });

  it('throws USER_UNCAUGHT_ERROR when the resolver returns an error', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockResolvedValueOnce(
      buildExecuteResult(null, { errorMessage: 'boom' }),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.SERVER_ROUTE_USER_UNCAUGHT_ERROR,
    });
  });

  it('throws LOGIC_FUNCTION_NOT_FOUND when the target named by the resolver is missing in the resolved workspace', async () => {
    logicFunctionRepository.findOne.mockReset();
    logicFunctionRepository.findOne
      // resolver lookup succeeds
      .mockResolvedValueOnce({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: 'resolver-id',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      // target lookup returns null
      .mockResolvedValueOnce(null);

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('surfaces a target userError as a server-route exception', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute
      .mockResolvedValueOnce(
        buildExecuteResult({
          workspaceId: 'target-ws',
          targetLogicFunctionUniversalIdentifier: TARGET_UID,
        }),
      )
      .mockResolvedValueOnce(
        buildExecuteResult(null, { errorMessage: 'boom' }),
      );

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.SERVER_ROUTE_USER_UNCAUGHT_ERROR,
    });
  });

  it('maps a LogicFunctionExecutionException(LOGIC_FUNCTION_NOT_FOUND) to the server-route not-found code', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockRejectedValue(
      new LogicFunctionExecutionException(
        'not found',
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      ),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('falls back to PLATFORM_ERROR for any other thrown executor error', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockRejectedValue(new Error('boom'));

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.SERVER_ROUTE_PLATFORM_ERROR,
    });
  });

  it('looks up the resolver by universalIdentifier and loads the application registration chain', async () => {
    await handle();

    const findArgs = logicFunctionRepository.find.mock.calls[0][0];

    expect(findArgs?.where).toEqual(
      expect.objectContaining({ universalIdentifier: RESOLVER_UID }),
    );
    expect(findArgs?.relations).toEqual(
      expect.objectContaining({
        application: expect.objectContaining({
          applicationRegistration: true,
        }),
      }),
    );
  });

  it('maps a LogicFunctionExecutionException(RATE_LIMIT_EXCEEDED) to the server-route rate-limit code', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockRejectedValue(
      new LogicFunctionExecutionException(
        'too many requests',
        LogicFunctionExecutionExceptionCode.RATE_LIMIT_EXCEEDED,
      ),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.RATE_LIMIT_EXCEEDED,
    });
  });

  it('scopes the target lookup to the resolver application registration', async () => {
    await handle();

    expect(logicFunctionRepository.findOne).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          universalIdentifier: TARGET_UID,
          workspaceId: 'target-ws',
          application: { applicationRegistrationId: 'reg-1' },
        }),
      }),
    );
  });

  it('throws LOGIC_FUNCTION_NOT_FOUND when the resolver is not linked to an application registration', async () => {
    logicFunctionRepository.find.mockResolvedValue([
      buildResolverRow({
        application: {
          applicationRegistration: { ownerWorkspaceId: 'owner-ws' },
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any);

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('does not leak the raw executor error message to the caller', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute
      .mockResolvedValueOnce(
        buildExecuteResult({
          workspaceId: 'target-ws',
          targetLogicFunctionUniversalIdentifier: TARGET_UID,
        }),
      )
      .mockRejectedValueOnce(
        new Error('internal: connection to lambda-internal:5000 refused'),
      );

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.SERVER_ROUTE_PLATFORM_ERROR,
      message: 'An unexpected error occurred while handling the server route',
    });
  });
});
