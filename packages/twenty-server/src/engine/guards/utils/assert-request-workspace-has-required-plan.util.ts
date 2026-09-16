/* @license Enterprise */

export type AssertRequestWorkspaceHasRequiredPlanParams = {
  isEnforcementEnabled: boolean;
  workspaceId: string | undefined;
  skipPlanRequired?: boolean;
  assertWorkspaceHasRequiredPlan: (workspaceId: string) => Promise<void>;
};

/**
 * Shared plan-required gate for HTTP/GraphQL APP_GUARD and future surfaces.
 * Flag off / no workspaceId / skip → proceed; else assert (BILLING_PLAN_REQUIRED).
 * No workspaceId proceeds so unauthenticated and Jwt-after-bind routes are not
 * false-denied; product routes with a bound workspace fail closed without a plan.
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
