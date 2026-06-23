import { type Request } from 'express';
import { type Repository } from 'typeorm';

import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  type LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { ServerWebhookTriggerExceptionCode } from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';
import { ServerWebhookTriggerService } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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

const RESOLVER_UID = 'resolver-uid';
const TARGET_UID = 'target-uid';

const buildRequest = (body: object | null = {}): Request =>
  ({
    method: 'POST',
    path: `/webhooks/server/${RESOLVER_UID}/${TARGET_UID}`,
    query: {},
    headers: {},
    rawBody: Buffer.from(JSON.stringify(body ?? {}), 'utf-8'),
    body,
  }) as unknown as Request;

describe('ServerWebhookTriggerService', () => {
  let service: ServerWebhookTriggerService;
  let queryBuilder: {
    innerJoin: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getOne: jest.Mock;
  };
  let logicFunctionRepository: jest.Mocked<
    Pick<Repository<LogicFunctionEntity>, 'createQueryBuilder'>
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
      targetLogicFunctionUniversalIdentifier: TARGET_UID,
    });

  beforeEach(() => {
    queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 'resolver-1',
        workspaceId: 'owner-ws',
        serverWebhookTriggerSettings: { forwardedRequestHeaders: ['x-test'] },
      }),
    };
    logicFunctionRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    logicFunctionExecutorService = {
      execute: jest
        .fn()
        // resolver returns { workspaceId, payload }
        .mockResolvedValueOnce(
          buildExecuteResult({
            workspaceId: 'target-ws',
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

    service = new ServerWebhookTriggerService(
      logicFunctionRepository as unknown as Repository<LogicFunctionEntity>,
      logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
      workspaceCacheService as unknown as WorkspaceCacheService,
      twentyConfigService as unknown as TwentyConfigService,
    );
  });

  it('runs the resolver in the owner workspace then the target in the resolved workspace', async () => {
    const result = await handle();

    expect(logicFunctionExecutorService.execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        logicFunctionId: 'resolver-1',
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
      code: ServerWebhookTriggerExceptionCode.FEATURE_DISABLED,
    });
  });

  it('throws LOGIC_FUNCTION_NOT_FOUND when no resolver exists in any owner workspace', async () => {
    queryBuilder.getOne.mockResolvedValue(null);

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('throws RESOLVER_INVALID_RESULT when the resolver does not return a workspaceId', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockResolvedValueOnce(
      buildExecuteResult({ not_a_workspace: true }),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.RESOLVER_INVALID_RESULT,
    });
  });

  it('throws USER_UNCAUGHT_ERROR when the resolver returns an error', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockResolvedValueOnce(
      buildExecuteResult(null, { errorMessage: 'boom' }),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
    });
  });

  it('throws LOGIC_FUNCTION_NOT_FOUND when the target is missing in the resolved workspace', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatLogicFunctionMaps: { byUniversalIdentifier: {} },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('surfaces a target userError as a webhook exception', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute
      .mockResolvedValueOnce(buildExecuteResult({ workspaceId: 'target-ws' }))
      .mockResolvedValueOnce(
        buildExecuteResult(null, { errorMessage: 'boom' }),
      );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
    });
  });

  it('maps a LogicFunctionExecutionException(LOGIC_FUNCTION_NOT_FOUND) to the webhook not-found code', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockRejectedValue(
      new LogicFunctionExecutionException(
        'not found',
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      ),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('falls back to PLATFORM_ERROR for any other thrown executor error', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockRejectedValue(new Error('boom'));

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_PLATFORM_ERROR,
    });
  });

  it('asserts the query filters by server-webhook + alive predicates', async () => {
    await handle();

    const whereClauses = [
      ...queryBuilder.where.mock.calls.map((c) => c[0]),
      ...queryBuilder.andWhere.mock.calls.map((c) => c[0]),
    ];

    expect(whereClauses).toEqual(
      expect.arrayContaining([
        expect.stringContaining('lf."universalIdentifier" = :uid'),
        expect.stringContaining('lf."workspaceId" = reg."workspaceId"'),
        expect.stringContaining(
          'lf."serverWebhookTriggerSettings" IS NOT NULL',
        ),
        expect.stringContaining('lf."deletedAt" IS NULL'),
        expect.stringContaining('reg."deletedAt" IS NULL'),
        expect.stringContaining('reg."workspaceId" IS NOT NULL'),
      ]),
    );
  });
});
