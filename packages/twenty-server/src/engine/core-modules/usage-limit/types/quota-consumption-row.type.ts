export type QuotaConsumptionRow = {
  operationType: string;
  userWorkspaceId: string;
  apiKeyId: string;
  applicationId: string;
  agentId: string;
  creditsUsedMicro: string | number;
  quantity: string | number;
};
