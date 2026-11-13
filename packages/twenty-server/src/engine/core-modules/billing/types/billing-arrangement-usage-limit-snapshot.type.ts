/* @license Enterprise */

export type BillingArrangementUsageLimitSnapshot = {
  resourceType: string;
  operationType: string;
  spenderType: string;
  spenderId: string;
  limitKind: string;
  periodCount: number;
  periodUnit: string;
  unit: string;
  limitValue: number;
  burstValue: number | null;
};
