export const buildUserAllowanceCounterKey = ({
  workspaceId,
  userWorkspaceId,
  periodStart,
}: {
  workspaceId: string;
  userWorkspaceId: string;
  periodStart: Date;
}): string =>
  `{${workspaceId}}:quota-consumed:user-allowance:${userWorkspaceId}:${periodStart.getTime()}`;
