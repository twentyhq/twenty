import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export type ChargeMetadata = {
  workspaceId: string;
  planKey: BillingPlanKey;
  interChargeCode: string;
};
