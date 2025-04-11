/* @license Enterprise */

export type BillingSubscriptionItemMetadata =
  | {
      trialPeriodFreeWorkflowCredits: number;
    }
  | Record<string, never>;
