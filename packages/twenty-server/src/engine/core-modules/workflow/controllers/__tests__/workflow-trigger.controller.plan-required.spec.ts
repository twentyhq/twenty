/* @license Enterprise */

jest.mock(
  'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service',
  () => ({
    WorkflowTriggerWorkspaceService: class WorkflowTriggerWorkspaceService {},
  }),
);

jest.mock('src/engine/twenty-orm/workspace-orm.manager', () => ({
  WorkspaceOrmManager: class WorkspaceOrmManager {},
}));

jest.mock('src/engine/twenty-orm/utils/build-system-auth-context.util', () => ({
  buildSystemAuthContext: jest.fn(() => ({})),
}));

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
    LogicFunctionExecutionExceptionCode: {},
    LogicFunctionExecutorService: class LogicFunctionExecutorService {},
  }),
);

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { WorkflowTriggerController } from 'src/engine/core-modules/workflow/controllers/workflow-trigger.controller';

describe('WorkflowTriggerController plan-required gate', () => {
  const assertWorkspaceHasRequiredPlan = jest.fn();
  const getConfig = jest.fn();
  const existsBy = jest.fn();
  const executeInWorkspaceContext = jest.fn();

  const buildController = () =>
    new WorkflowTriggerController(
      { executeInWorkspaceContext } as never,
      { runWorkflowVersion: jest.fn() } as never,
      { assertWorkspaceHasRequiredPlan } as never,
      { get: getConfig } as never,
      { existsBy } as never,
    );

  beforeEach(() => {
    assertWorkspaceHasRequiredPlan.mockReset();
    getConfig.mockReset();
    existsBy.mockReset();
    executeInWorkspaceContext.mockReset();

    getConfig.mockImplementation((key: string) => {
      if (key === 'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED') {
        return true;
      }

      return false;
    });
    existsBy.mockResolvedValue(true);
  });

  it('rejects unpaid workflow webhook when flag on', async () => {
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    const controller = buildController();

    await expect(
      controller.runWorkflowByPostRequest('ws-unpaid', 'wf-1', {
        body: {},
      } as never),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PLAN_REQUIRED,
    });

    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-unpaid');
    expect(executeInWorkspaceContext).not.toHaveBeenCalled();
  });

  it('does not assert when enforcement flag is off', async () => {
    getConfig.mockReturnValue(false);
    executeInWorkspaceContext.mockRejectedValue(new Error('stop after gate'));

    const controller = buildController();

    await expect(
      controller.runWorkflowByGetRequest('ws-1', 'wf-1'),
    ).rejects.toThrow('stop after gate');

    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });
});
