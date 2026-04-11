/* @license Enterprise */

// Poll every 2 minutes. Overshoot past the tier cap is bounded by
// (poll interval) * (peak credit-burn rate). The inline canWorkspaceUse check
// in the workflow hot path is the real-time guardrail; this cron is the
// source-of-truth for the hasReachedCurrentPeriodCap flag.
export const enforceUsageCapCronPattern = '*/2 * * * *';
