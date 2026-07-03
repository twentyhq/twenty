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

type QueryBuilderMock = {
  innerJoinAndSelect: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  getOne: jest.Mock;
};

const buildResolverRow = () => ({
  id: 'resolver-id',
  universalIdentifier: RESOLVER_UID,
  workspaceId: 'owner-ws',
  serverRouteTriggerSettings: { forwardedRequestHeaders: ['x-test'] },
  application: {
    applicationRegistration: { id: 'reg-1', ownerWorkspaceId: 'owner-ws' },
  },
});

describe('ServerRouteTriggerService', () => {
  let service: ServerRouteTriggerService;
  let logicFunctionRepository: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
  };
  let logicFunctionExecutorService: jest.Mocked<
    Pick<LogicFunctionExecutorService, 'execute'>
  >;

  let resolverRow: unknown;
  let queryBuilder: QueryBuilderMock;

  const buildQueryBuilderMock = (): QueryBuilderMock => {
    const qb: QueryBuilderMock = {
      innerJoinAndSelect: jest.fn(() => qb),
      where: jest.fn(() => qb),
      andWhere: jest.fn(() => qb),
      getOne: jest.fn(() => Promise.resolve(resolverRow)),
    };

    return qb;
  };

  const handle = () =>
    service.handle({
      request: buildRequest(),
      resolverLogicFunctionUniversalIdentifier: RESOLVER_UID,
    });

  beforeEach(() => {
    resolverRow = buildResolverRow();
    queryBuilder = buildQueryBuilderMock();

    logicFunctionRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder),
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

    service = new ServerRouteTriggerService(
      logicFunctionRepository as unknown as Repository<LogicFunctionEntity>,
      logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
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

  it('queries the resolver by universalIdentifier and joins the application registration chain', async () => {
    await handle();

    expect(logicFunctionRepository.createQueryBuilder).toHaveBeenCalledWith(
      'logicFunction',
    );
    expect(queryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
      'logicFunction.application',
      'application',
    );
    expect(queryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
      'application.applicationRegistration',
      'applicationRegistration',
    );
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'logicFunction.universalIdentifier = :universalIdentifier',
      { universalIdentifier: RESOLVER_UID },
    );
  });

  it('restricts the resolver query to server-route-exposed, owner-workspace functions', async () => {
    await handle();

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'logicFunction.serverRouteTriggerSettings IS NOT NULL',
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'logicFunction.workspaceId = applicationRegistration.ownerWorkspaceId',
    );
  });

  it('throws LOGIC_FUNCTION_NOT_FOUND and executes nothing when the query returns no server-route resolver', async () => {
    resolverRow = null;

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
    expect(logicFunctionExecutorService.execute).not.toHaveBeenCalled();
  });

  it('rejects and executes nothing when the resolver requires authentication', async () => {
    resolverRow = {
      ...buildResolverRow(),
      httpRouteTriggerSettings: { isAuthRequired: true },
    };

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.RESOLVER_REQUIRES_AUTHENTICATION,
    });
    expect(logicFunctionExecutorService.execute).not.toHaveBeenCalled();
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
      .mockResolvedValueOnce({ id: 'resolver-id' })
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
