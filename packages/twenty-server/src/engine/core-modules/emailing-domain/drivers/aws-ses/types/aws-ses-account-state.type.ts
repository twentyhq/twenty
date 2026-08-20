export type AwsSesAccountState = {
  isProductionAccessEnabled: boolean;
  enforcementStatus: string | undefined;
  max24HourSend: number | undefined;
  maxSendRate: number | undefined;
  sentLast24Hours: number | undefined;
};
