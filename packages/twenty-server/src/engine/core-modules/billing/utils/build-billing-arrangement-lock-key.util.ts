/* @license Enterprise */

export const buildBillingArrangementLockKey = (workspaceId: string): string =>
  `billing-arrangement:${workspaceId}`;
