import { type Request } from 'express';
import { type Repository } from 'typeorm';

import { type LogicFunctionTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service';
import { ServerWebhookTriggerExceptionCode } from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';
import { ServerWebhookTriggerService } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const LOGIC_FUNCTION_UID = 'lf-universal-id';

const buildRequest = (body: object | null = {}): Request =>
  ({
    method: 'POST',
    path: `/webhooks/server/${LOGIC_FUNCTION_UID}`,
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
  let logicFunctionTriggerService: jest.Mocked<
    Pick<LogicFunctionTriggerService, 'run'>
  >;
  let twentyConfigService: jest.Mocked<Pick<TwentyConfigService, 'get'>>;

  const handle = () =>
    service.handle({
      request: buildRequest(),
      logicFunctionUniversalIdentifier: LOGIC_FUNCTION_UID,
    });

  beforeEach(() => {
    queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 'lf-1',
        workspaceId: 'ws-1',
        serverWebhookTriggerSettings: { forwardedRequestHeaders: ['x-test'] },
      }),
    };
    logicFunctionRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    logicFunctionTriggerService = {
      run: jest.fn().mockResolvedValue({
        kind: 'response',
        response: { statusCode: 200, headers: {}, body: { ok: true } },
      }),
    };
    twentyConfigService = { get: jest.fn().mockReturnValue(true) };

    service = new ServerWebhookTriggerService(
      logicFunctionRepository as unknown as Repository<LogicFunctionEntity>,
      logicFunctionTriggerService as unknown as LogicFunctionTriggerService,
      twentyConfigService as unknown as TwentyConfigService,
    );
  });

  it('resolves the owner-workspace copy and runs it', async () => {
    const result = await handle();

    expect(logicFunctionTriggerService.run).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunction: expect.objectContaining({
          id: 'lf-1',
          workspaceId: 'ws-1',
        }),
        forwardedRequestHeaders: ['x-test'],
        userId: null,
        userWorkspaceId: null,
      }),
    );
    expect(result).toEqual({
      statusCode: 200,
      headers: {},
      body: { ok: true },
    });
  });

  it('refuses when the feature is disabled', async () => {
    twentyConfigService.get.mockReturnValue(false);

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.FEATURE_DISABLED,
    });
  });

  it('throws LOGIC_FUNCTION_NOT_FOUND when no owner-workspace copy exists', async () => {
    queryBuilder.getOne.mockResolvedValue(null);

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('surfaces a userError as a webhook exception', async () => {
    logicFunctionTriggerService.run.mockResolvedValue({
      kind: 'userError',
      errorMessage: 'boom',
    });

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
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
