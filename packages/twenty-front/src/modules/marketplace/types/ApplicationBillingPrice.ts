export type ApplicationBillingPrice = {
  universalIdentifier: string;
  label: string;
  type: string;
  billingPeriod: string;
  amountCents: number;
  currency: string;
  per?: string | null;
};
