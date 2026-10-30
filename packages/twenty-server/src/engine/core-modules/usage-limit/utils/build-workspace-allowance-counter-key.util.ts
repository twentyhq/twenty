export const buildWorkspaceAllowanceCounterKey = ({
  workspaceId,
  periodStart,
}: {
  workspaceId: string;
  periodStart: Date;
}): string =>
  `{${workspaceId}}:quota-consumed:allowance:${periodStart.getTime()}`;
