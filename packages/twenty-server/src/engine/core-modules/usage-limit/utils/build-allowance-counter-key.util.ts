export const buildAllowanceCounterKey = ({
  workspaceId,
  periodStart,
}: {
  workspaceId: string;
  periodStart: Date;
}): string =>
  `{${workspaceId}}:quota-consumed:allowance:${periodStart.getTime()}`;
