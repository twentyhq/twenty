/* @license Enterprise */

export type AssertRequestWorkspaceHasRequiredPlanParams = {
  isEnforcementEnabled: boolean;
  workspaceId: string | undefined;
  skipPlanRequired?: boolean;
  assertWorkspaceHasRequiredPlan: (workspaceId: string) => Promise<void>;
};

/**
 * Shared plan-required gate for HTTP surfaces where workspace is known
 * outside APP_GUARD timing (Jwt-after-bind, public product runners).
 * Mirrors WorkspacePlanRequiredGuard / assertMessageQueueJobPlanRequired:
 * flag off / no workspaceId / skip → proceed; else assert (BILLING_PLAN_REQUIRED).
 */
export const assertRequestWorkspaceHasRequiredPlan = async ({
  isEnforcementEnabled,
  workspaceId,
  skipPlanRequired = false,
  assertWorkspaceHasRequiredPlan,
}: AssertRequestWorkspaceHasRequiredPlanParams): Promise<void> => {
  if (!isEnforcementEnabled) {
    return;
  }

  if (!workspaceId) {
    return;
  }

  if (skipPlanRequired) {
    return;
  }

  await assertWorkspaceHasRequiredPlan(workspaceId);
};
