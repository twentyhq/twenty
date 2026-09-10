export const buildQuotaWarmLockKey = (workspaceId: string): string =>
  `usage-quota-warm:${workspaceId}`;
