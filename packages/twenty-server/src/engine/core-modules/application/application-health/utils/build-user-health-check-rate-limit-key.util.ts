export const buildUserHealthCheckRateLimitKey = ({
  workspaceId,
  userWorkspaceId,
  applicationId,
}: {
  workspaceId: string;
  userWorkspaceId: string;
  applicationId: string;
}): string =>
  `user-health-check:${workspaceId}:${userWorkspaceId}:${applicationId}`;
