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
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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
    path: `/server-routes/${RESOLVER_UID}`,
    query: {},
    headers: {},
    rawBody: Buffer.from(JSON.stringify(body ?? {}), 'utf-8'),
    body,
  }) as unknown as Request;

describe('ServerRouteTriggerService', () => {
  let service: ServerRouteTriggerService;
  let logicFunctionRepository: jest.Mocked<
    Pick<Repository<LogicFunctionEntity>, 'findOne'>
  >;
  let logicFunctionExecutorService: jest.Mocked<
    Pick<LogicFunctionExecutorService, 'execute'>
  >;
  let workspaceCacheService: jest.Mocked<
    Pick<WorkspaceCacheService, 'getOrRecompute'>
  >;
  let twentyConfigService: jest.Mocked<Pick<TwentyConfigService, 'get'>>;

  const handle = () =>
    service.handle({
      request: buildRequest(),
      resolverLogicFunctionUniversalIdentifier: RESOLVER_UID,
    });

  beforeEach(() => {
    logicFunctionRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'resolver-id',
        workspaceId: 'owner-ws',
        serverRouteTriggerSettings: { forwardedRequestHeaders: ['x-test'] },
      }),
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
    workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatLogicFunctionMaps: {
          byUniversalIdentifier: {
            'target-id': {
              id: 'target-id',
              universalIdentifier: TARGET_UID,
              deletedAt: null,
            },
          },
        },
      }),
    };
    twentyConfigService = { get: jest.fn().mockReturnValue(true) };

    service = new ServerRouteTriggerService(
      logicFunctionRepository as unknown as Repository<LogicFunctionEntity>,
      logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
      workspaceCacheService as unknown as WorkspaceCacheService,
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

  it('throws LOGIC_FUNCTION_NOT_FOUND when the resolver is not found', async () => {
    logicFunctionRepository.findOne.mockResolvedValue(null);

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
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
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatLogicFunctionMaps: { byUniversalIdentifier: {} },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

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

  it('looks up the resolver by universalIdentifier and serverRouteTriggerSettings opt-in', async () => {
    await handle();

    const findArgs = logicFunctionRepository.findOne.mock.calls[0][0];

    expect(findArgs?.where).toEqual(
      expect.objectContaining({
        universalIdentifier: RESOLVER_UID,
        serverRouteTriggerSettings: expect.anything(),
      }),
    );
  });

  it('surfaces a workspace-cache failure on the target lookup as PLATFORM_ERROR (not LOGIC_FUNCTION_NOT_FOUND)', async () => {
    workspaceCacheService.getOrRecompute.mockRejectedValue(
      new Error('cache outage'),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.SERVER_ROUTE_PLATFORM_ERROR,
    });
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
});
