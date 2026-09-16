/* @license Enterprise */

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service',
  () => ({
    LogicFunctionExecutionException: class LogicFunctionExecutionException extends Error {
      constructor(
        message: string,
        public code: string,
      ) {
        super(message);
      }
    },
    LogicFunctionExecutionExceptionCode: {
      LOGIC_FUNCTION_NOT_FOUND: 'LOGIC_FUNCTION_NOT_FOUND',
      RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    },
    LogicFunctionExecutorService: class LogicFunctionExecutorService {},
  }),
);

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { ServerRouteTriggerService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.service';

describe('ServerRouteTriggerService plan-required gate', () => {
  const assertWorkspaceHasRequiredPlan = jest.fn();
  const getConfig = jest.fn();
  const createQueryBuilder = jest.fn();
  const execute = jest.fn();
  const add = jest.fn();
  const findOne = jest.fn();

  const ownerWorkspaceId = '11111111-1111-4111-8111-111111111111';
  const unpaidWorkspaceId = '22222222-2222-4222-8222-222222222222';
  const paidWorkspaceId = '55555555-5555-4555-8555-555555555555';
  const resolverUid = '33333333-3333-4333-8333-333333333333';
  const targetUid = '44444444-4444-4444-8444-444444444444';

  const resolver = {
    universalIdentifier: resolverUid,
    workspaceId: ownerWorkspaceId,
    serverRouteTriggerSettings: {
      httpMethods: ['POST'],
      forwardedRequestHeaders: [],
    },
    httpRouteTriggerSettings: null,
    application: {
      applicationRegistration: { id: 'app-reg-1' },
    },
  };

  const mockRequest = {
    method: 'POST',
    headers: {},
    body: {},
    query: {},
    path: '/webhooks/server/resolver',
  } as never;

  const buildService = () =>
    new ServerRouteTriggerService(
      {
        createQueryBuilder,
        findOne,
      } as never,
      { execute } as never,
      { add } as never,
      { assertWorkspaceHasRequiredPlan } as never,
      { get: getConfig } as never,
    );

  beforeEach(() => {
    assertWorkspaceHasRequiredPlan.mockReset();
    getConfig.mockReset();
    createQueryBuilder.mockReset();
    execute.mockReset();
    add.mockReset();
    findOne.mockReset();

    getConfig.mockImplementation((key: string) => {
      if (key === 'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED') {
        return true;
      }

      return undefined;
    });

    createQueryBuilder.mockReturnValue({
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(resolver),
    });
  });

  it('does not assert plan on marketplace owner before sync execution', async () => {
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );
    findOne.mockResolvedValue({
      id: 'fn-1',
      universalIdentifier: resolverUid,
    });
    execute.mockResolvedValue({
      data: {
        __twentyHttpResponse: true,
        status: 200,
        headers: {},
        body: { ok: true },
      },
    });

    const service = buildService();

    // Owner unpaid must NOT block HTTP response path (no customer target).
    assertWorkspaceHasRequiredPlan.mockReset();
    assertWorkspaceHasRequiredPlan.mockResolvedValue(undefined);

    await expect(
      service.handle({
        request: mockRequest,
        resolverLogicFunctionUniversalIdentifier: resolverUid,
      }),
    ).resolves.toBeDefined();

    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalledWith(
      ownerWorkspaceId,
    );
  });

  it('asserts plan for dispatch target workspace before enqueue', async () => {
    assertWorkspaceHasRequiredPlan.mockResolvedValue(undefined);
    findOne.mockResolvedValue({
      id: 'fn-1',
      universalIdentifier: targetUid,
    });
    execute.mockResolvedValue({
      data: {
        targetLogicFunctionUniversalIdentifier: targetUid,
        workspaceId: unpaidWorkspaceId,
        payload: { hello: 'world' },
      },
    });

    const service = buildService();

    await service.handle({
      request: mockRequest,
      resolverLogicFunctionUniversalIdentifier: resolverUid,
    });

    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith(
      unpaidWorkspaceId,
    );
    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalledWith(
      ownerWorkspaceId,
    );
    expect(add).toHaveBeenCalled();
  });

  it('402s when dispatch target is unpaid even if owner would be paid', async () => {
    assertWorkspaceHasRequiredPlan.mockImplementation(async (id: string) => {
      if (id === unpaidWorkspaceId) {
        throw new BillingException(
          'Workspace subscription plan is required',
          BillingExceptionCode.BILLING_PLAN_REQUIRED,
        );
      }
    });
    findOne.mockResolvedValue({
      id: 'fn-1',
      universalIdentifier: targetUid,
    });
    execute.mockResolvedValue({
      data: {
        targetLogicFunctionUniversalIdentifier: targetUid,
        workspaceId: unpaidWorkspaceId,
        payload: {},
      },
    });

    const service = buildService();

    await expect(
      service.handle({
        request: mockRequest,
        resolverLogicFunctionUniversalIdentifier: resolverUid,
      }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PLAN_REQUIRED,
    });
    expect(add).not.toHaveBeenCalled();
  });

  it('allows enqueue when owner is unpaid but target customer is paid', async () => {
    assertWorkspaceHasRequiredPlan.mockImplementation(async (id: string) => {
      if (id === ownerWorkspaceId) {
        throw new BillingException(
          'Workspace subscription plan is required',
          BillingExceptionCode.BILLING_PLAN_REQUIRED,
        );
      }
    });
    findOne.mockResolvedValue({
      id: 'fn-1',
      universalIdentifier: targetUid,
    });
    execute.mockResolvedValue({
      data: {
        targetLogicFunctionUniversalIdentifier: targetUid,
        workspaceId: paidWorkspaceId,
        payload: {},
      },
    });

    const service = buildService();

    await service.handle({
      request: mockRequest,
      resolverLogicFunctionUniversalIdentifier: resolverUid,
    });

    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith(
      paidWorkspaceId,
    );
    expect(add).toHaveBeenCalled();
  });

  it('skips plan assert when enforcement flag is off', async () => {
    getConfig.mockImplementation((key: string) => {
      if (key === 'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED') {
        return false;
      }

      return undefined;
    });
    assertWorkspaceHasRequiredPlan.mockResolvedValue(undefined);
    findOne.mockResolvedValue({
      id: 'fn-1',
      universalIdentifier: resolverUid,
    });
    execute.mockResolvedValue({
      data: {
        __twentyHttpResponse: true,
        status: 200,
        headers: {},
        body: { ok: true },
      },
    });

    const service = buildService();

    await service.handle({
      request: mockRequest,
      resolverLogicFunctionUniversalIdentifier: resolverUid,
    });

    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });
});
