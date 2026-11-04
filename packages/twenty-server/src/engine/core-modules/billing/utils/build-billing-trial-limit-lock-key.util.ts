/* @license Enterprise */

export const buildBillingTrialLimitLockKey = (userId: string): string =>
  `billing-trial-limit:${userId}`;
