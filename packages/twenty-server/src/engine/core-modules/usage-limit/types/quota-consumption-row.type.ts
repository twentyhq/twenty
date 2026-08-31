export type QuotaConsumptionRow = {
  operationType: string;
  userWorkspaceId: string;
  apiKeyId: string;
  applicationId: string;
  creditsUsedMicro: string | number;
  quantity: string | number;
};
