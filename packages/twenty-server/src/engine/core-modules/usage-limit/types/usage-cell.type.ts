// One cell of the period-to-date usage aggregate a cold counter is rebuilt
// from: the warm query groups usageEvent by operation and spender columns.
export type UsageCell = {
  operationType: string;
  userWorkspaceId: string;
  apiKeyId: string;
  applicationId: string;
  agentId: string;
  workflowId: string;
  logicFunctionId: string;
  total: number;
};
