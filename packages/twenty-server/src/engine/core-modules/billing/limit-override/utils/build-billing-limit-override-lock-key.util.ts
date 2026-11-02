/* @license Enterprise */

// Operator edits and the expiry cron each read then rewrite a limit's arrangements, so they must not interleave
export const buildBillingLimitOverrideLockKey = (
  usageLimitId: string,
): string => `billing-limit-override:${usageLimitId}`;
