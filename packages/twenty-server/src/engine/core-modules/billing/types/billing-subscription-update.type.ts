import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

export enum SubscriptionUpdateType {
  PLAN = 'PLAN',
  METERED_PRICE = 'METERED_PRICE',
  SEATS = 'SEATS',
  INTERVAL = 'INTERVAL',
}

export type SubscriptionUpdate =
  | {
      type: SubscriptionUpdateType.PLAN;
      newPlan: BillingPlanKey;
    }
  | {
      type: SubscriptionUpdateType.METERED_PRICE;
      newMeteredPriceId: string;
    }
  | {
      type: SubscriptionUpdateType.SEATS;
      newSeats: number;
    }
  | {
      type: SubscriptionUpdateType.INTERVAL;
      newInterval: SubscriptionInterval;
    };
