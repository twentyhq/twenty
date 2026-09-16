/* @license Enterprise */

export type AssertMessageQueueJobPlanRequiredParams = {
  isEnforcementEnabled: boolean;
  workspaceId: string | undefined;
  skipPlanRequired: boolean;
  assertWorkspaceHasRequiredPlan: (workspaceId: string) => Promise<void>;
};

/**
 * Shared plan-required gate for message-queue workers.
 * Mirrors WorkspacePlanRequiredGuard: flag off / no workspaceId / skip → proceed;
 * otherwise assertWorkspaceHasRequiredPlan (throws BILLING_PLAN_REQUIRED).
 */
export const assertMessageQueueJobPlanRequired = async ({
  isEnforcementEnabled,
  workspaceId,
  skipPlanRequired,
  assertWorkspaceHasRequiredPlan,
}: AssertMessageQueueJobPlanRequiredParams): Promise<void> => {
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
