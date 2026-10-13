export const buildMemberAllowanceCounterKey = ({
  workspaceId,
  userWorkspaceId,
  periodStart,
}: {
  workspaceId: string;
  userWorkspaceId: string;
  periodStart: Date;
}): string =>
  `{${workspaceId}}:quota-consumed:member-allowance:${userWorkspaceId}:${periodStart.getTime()}`;
