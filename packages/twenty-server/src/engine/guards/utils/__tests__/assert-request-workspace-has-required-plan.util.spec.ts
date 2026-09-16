/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { assertRequestWorkspaceHasRequiredPlan } from 'src/engine/guards/utils/assert-request-workspace-has-required-plan.util';

describe('assertRequestWorkspaceHasRequiredPlan', () => {
  const assertWorkspaceHasRequiredPlan = jest.fn();

  beforeEach(() => {
    assertWorkspaceHasRequiredPlan.mockReset();
    assertWorkspaceHasRequiredPlan.mockResolvedValue(undefined);
  });

  it('proceeds when enforcement flag is off', async () => {
    await expect(
      assertRequestWorkspaceHasRequiredPlan({
        isEnforcementEnabled: false,
        workspaceId: 'ws-1',
        assertWorkspaceHasRequiredPlan,
      }),
    ).resolves.toBeUndefined();

    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('proceeds when request has no workspaceId', async () => {
    await expect(
      assertRequestWorkspaceHasRequiredPlan({
        isEnforcementEnabled: true,
        workspaceId: undefined,
        assertWorkspaceHasRequiredPlan,
      }),
    ).resolves.toBeUndefined();

    expect(assertWorkspaceHasRequiredPlan).not.toHaveBeenCalled();
  });

  it('proceeds when skipPlanRequired is set', async () => {
    await expect(
      assertRequestWorkspaceHasRequiredPlan({
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
      assertRequestWorkspaceHasRequiredPlan({
        isEnforcementEnabled: true,
        workspaceId: 'ws-1',
        assertWorkspaceHasRequiredPlan,
      }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PLAN_REQUIRED,
    });

    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-1');
  });

  it('proceeds when assertWorkspaceHasRequiredPlan resolves', async () => {
    await expect(
      assertRequestWorkspaceHasRequiredPlan({
        isEnforcementEnabled: true,
        workspaceId: 'ws-1',
        assertWorkspaceHasRequiredPlan,
      }),
    ).resolves.toBeUndefined();

    expect(assertWorkspaceHasRequiredPlan).toHaveBeenCalledWith('ws-1');
  });
});
