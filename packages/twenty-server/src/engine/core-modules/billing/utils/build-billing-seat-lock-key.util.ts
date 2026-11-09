/* @license Enterprise */

export const buildBillingSeatLockKey = (workspaceId: string): string =>
  `billing-seat:${workspaceId}`;
