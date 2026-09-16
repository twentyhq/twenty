/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { assertMessageQueueJobPlanRequired } from 'src/engine/core-modules/message-queue/utils/assert-message-queue-job-plan-required.util';

describe('assertMessageQueueJobPlanRequired', () => {
  const assertWorkspaceHasRequiredPlan = jest.fn();

  beforeEach(() => {
    assertWorkspaceHasRequiredPlan.mockReset();
    assertWorkspaceHasRequiredPlan.mockResolvedValue(undefined);
  });

  it('proceeds when enforcement flag is off', async () => {
    await expect(
      assertMessageQueueJobPlanRequired({
        isEnforcementEnabled: false,
        workspaceId: 'ws-1',
        skipPlanRequired: false,
        assertWorkspaceHasRequiredPlan,
      }),
    ).resolves.toBeUndefined();

    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('proceeds when job has no workspaceId', async () => {
    await expect(
      assertMessageQueueJobPlanRequired({
        isEnforcementEnabled: true,
        workspaceId: undefined,
        skipPlanRequired: false,
        assertWorkspaceHasRequiredPlan,
      }),
    ).resolves.toBeUndefined();

    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('proceeds when @SkipPlanRequired metadata is set', async () => {
    await expect(
      assertMessageQueueJobPlanRequired({
        isEnforcementEnabled: true,
        workspaceId: 'ws-1',
        skipPlanRequired: true,
        assertWorkspaceHasRequiredPlan,
      }),
    ).resolves.toBeUndefined();

    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('rejects when assertWorkspaceHasRequiredPlan throws', async () => {
    assertWorkspaceHasRequiredPlan.mockRejectedValue(
      new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      ),
    );

    await expect(
      assertMessageQueueJobPlanRequired({
        isEnforcementEnabled: true,
        workspaceId: 'ws-1',
        skipPlanRequired: false,
        assertWorkspaceHasRequiredPlan,
      }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PLAN_REQUIRED,
    });

    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-1');
  });

  it('proceeds when assertWorkspaceHasRequiredPlan resolves', async () => {
    await expect(
      assertMessageQueueJobPlanRequired({
        isEnforcementEnabled: true,
        workspaceId: 'ws-1',
        skipPlanRequired: false,
        assertWorkspaceHasRequiredPlan,
      }),
    ).resolves.toBeUndefined();

    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-1');
  });
});
