// One cell of the period-to-date usage aggregate a cold counter is rebuilt
// from: the warm query groups usageEvent by operation and user.
export type UsageCell = {
  operationType: string;
  userWorkspaceId: string;
  total: number;
};
