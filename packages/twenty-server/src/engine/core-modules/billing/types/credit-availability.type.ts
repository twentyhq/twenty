import { type SubscriptionInactiveReason } from 'src/engine/core-modules/billing/types/subscription-inactive-reason.type';

export type CreditAvailability =
  | { hasAvailableCredits: true }
  | {
      hasAvailableCredits: false;
      reason: SubscriptionInactiveReason | 'NO_CREDITS';
    };
