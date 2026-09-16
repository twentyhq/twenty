/* @license Enterprise */

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service',
  () => ({
    LogicFunctionTriggerService: class LogicFunctionTriggerService {},
  }),
);

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

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { HTTPMethod } from 'twenty-shared/types';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { RouteTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';

describe('RouteTriggerService plan-required gate', () => {
  const assertWorkspaceHasRequiredPlan = jest.fn();
  const getConfig = jest.fn();
  const resolveWorkspaceAndPublicDomain = jest.fn();
  const find = jest.fn();

  const buildService = () =>
    new RouteTriggerService(
      { validateTokenByRequest: jest.fn() } as never,
      { run: jest.fn() } as never,
      {
        resolveWorkspaceAndPublicDomain,
        buildPublicFunctionUrl: jest.fn(),
      } as never,
      { get: getConfig } as never,
      { assertWorkspaceHasRequiredPlan } as never,
      { find } as never,
    );

  beforeEach(() => {
    assertWorkspaceHasRequiredPlan.mockReset();
    getConfig.mockReset();
    resolveWorkspaceAndPublicDomain.mockReset();
    find.mockReset();

    getConfig.mockImplementation((key: string) => {
      if (key === 'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED') {
        return true;
      }

      return undefined;
    });

    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: {
        id: 'ws-unpaid',
        activationStatus: WorkspaceActivationStatus.ACTIVE,
        subdomain: 'test',
      },
      publicDomain: null,
      isIsolatedOrigin: false,
    });
  });

  it('rejects unpaid workspace product route when flag on', async () => {
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    const service = buildService();

    await expect(
      service.handle({
        request: {
          protocol: 'https',
          get: () => 'test.twenty.com',
          headers: {},
          path: '/s/hello',
        } as never,
        httpMethod: HTTPMethod.POST,
      }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PLAN_REQUIRED,
    });

    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-unpaid');
    expect(find).not.toHaveBeenCalled();
  });

  it('does not assert when enforcement flag is off', async () => {
    getConfig.mockReturnValue(false);
    find.mockResolvedValue([]);

    const service = buildService();

    await expect(
      service.handle({
        request: {
          protocol: 'https',
          get: () => 'test.twenty.com',
          headers: {},
          path: '/s/hello',
        } as never,
        httpMethod: HTTPMethod.POST,
      }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('No Route trigger found'),
    });

    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });
});
