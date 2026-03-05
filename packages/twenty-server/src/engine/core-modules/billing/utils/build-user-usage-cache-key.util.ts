/* @license Enterprise */

export const buildUserUsageCacheKey = (
  workspaceId: string,
  userWorkspaceId: string,
): string => `billing:user-usage:${workspaceId}:${userWorkspaceId}`;
