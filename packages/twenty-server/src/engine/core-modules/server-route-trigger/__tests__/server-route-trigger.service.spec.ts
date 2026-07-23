import { type Request } from 'express';
import { type Repository } from 'typeorm';

import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  type LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ServerRouteTriggerExceptionCode } from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { ServerRouteTriggerService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
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
  let messageQueueService: jest.Mocked<Pick<MessageQueueService, 'add'>>;

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
        // resolver lookup
        .mockResolvedValueOnce({ id: 'resolver-id' })
        // target lookup before enqueueing
        .mockResolvedValueOnce({ id: 'target-id' }),
    };
    logicFunctionExecutorService = {
      execute: jest.fn().mockResolvedValueOnce(
        buildExecuteResult({
          workspaceId: 'target-ws',
          targetLogicFunctionUniversalIdentifier: TARGET_UID,
          payload: { from: 'resolver' },
        }),
      ),
    };

    messageQueueService = {
      add: jest.fn().mockResolvedValue(undefined),
    };

    service = new ServerRouteTriggerService(
      logicFunctionRepository as unknown as Repository<LogicFunctionEntity>,
      logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
      messageQueueService as unknown as MessageQueueService,
    );
  });

  it('runs the resolver synchronously, enqueues the target, and acks with 202', async () => {
    const result = await handle();

    expect(logicFunctionExecutorService.execute).toHaveBeenCalledTimes(1);
    expect(logicFunctionExecutorService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionId: 'resolver-id',
        workspaceId: 'owner-ws',
      }),
    );
    expect(messageQueueService.add).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      [
        {
          logicFunctionId: 'target-id',
          workspaceId: 'target-ws',
          payload: { from: 'resolver' },
        },
      ],
      { retryLimit: 3 },
    );
    expect(result).toEqual(
      expect.objectContaining({
        statusCode: 202,
        body: { queued: true },
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

  it('throws LOGIC_FUNCTION_NOT_FOUND and executes nothing when the query returns no server-route resolver', async () => {
    resolverRow = null;

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
    expect(logicFunctionExecutorService.execute).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
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

  it('throws LOGIC_FUNCTION_NOT_FOUND and enqueues nothing when the target is missing', async () => {
    logicFunctionRepository.findOne.mockReset();
    logicFunctionRepository.findOne
      .mockResolvedValueOnce({ id: 'resolver-id' })
      .mockResolvedValueOnce(null);

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
    expect(messageQueueService.add).not.toHaveBeenCalled();
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

  it('maps a LogicFunctionException(LOGIC_FUNCTION_DISABLED) to the server-route disabled code', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockRejectedValue(
      new LogicFunctionException(
        'application is stopped',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
      ),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.LOGIC_FUNCTION_DISABLED,
    });
  });

  it('does not leak the raw resolver executor error message to the caller', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockRejectedValue(
      new Error('internal: connection to lambda-internal:5000 refused'),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.SERVER_ROUTE_PLATFORM_ERROR,
      message: 'An unexpected error occurred while handling the server route',
    });
  });
});
