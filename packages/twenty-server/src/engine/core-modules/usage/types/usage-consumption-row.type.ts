export type UsageConsumptionRow = {
  operationType: string;
  userWorkspaceId: string;
  apiKeyId: string;
  applicationId: string;
  agentId: string;
  workflowId: string;
  logicFunctionId: string;
  creditsUsedMicro: string | number;
  quantity: string | number;
};
