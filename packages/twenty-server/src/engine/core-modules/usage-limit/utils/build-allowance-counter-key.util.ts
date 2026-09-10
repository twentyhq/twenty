export const buildAllowanceCounterKey = ({
  workspaceId,
  periodStart,
}: {
  workspaceId: string;
  periodStart: Date;
}): string => `{${workspaceId}}:quota:allowance:${periodStart.getTime()}`;
