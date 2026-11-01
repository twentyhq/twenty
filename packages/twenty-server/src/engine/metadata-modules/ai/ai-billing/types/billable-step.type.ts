import { type BillingTokenUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/billing-token-usage.type';

export type BillableStep = {
  usage: BillingTokenUsage;
  providerMetadata?: Record<string, Record<string, unknown> | undefined>;
};
